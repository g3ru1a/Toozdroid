const Discord = require("discord.js");
const wrapper = require("./wrapper");
const Helpers = require("../helpers");
const axios = require("axios");
const checker_url = 'https://pickmaze.com/api/youtooz/getOrderItems.php?';

//#region Func. Show help embed
exports.showHelpMenu = function (message) {
    let prefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Collection Help", message.guild.me.user.avatarURL());
    embed.setDescription("Aliases: `" + prefix + "col` or `" + prefix + "collection`");
    embed.addField("Adds a figure to your collection.", "`" + prefix + "collection add <code>`", true);
    embed.addField("Showoff your collection.", "`" + prefix + "collection show [embed]`", true);
    if (Helpers.isMod(message)) {
        embed.addField("Force add a figure to a user's collection.", "`" + prefix + "collection push <FigureName> <@user>`", true);
        embed.addField("Force remove a figure from a user's collection.", "`" + prefix + "collection remove <FigureName> <@user>`", true);
        embed.addField("Link/Unlink Figures.", "`" + prefix + "collection figs <link/unlink> <Emoji> <FigureName>`", true);
        embed.addField("Create/Remove Rank Rules.", "`" + prefix + "collection rules <add/remove> <@rank> <FigureCount>`", true);
    }
    embed.setColor(0xFF467F);
    embed.setTimestamp();
    embed.setFooter("Configuration Help Menu");
    message.channel.send(embed);
}
//#endregion

exports.link = async function (message, args) {
    //Check for permission
    if (!Helpers.isMod(message)) return;
    //Check for enough args
    if (args.length < 4) { message.reply("Too few arguments"); return; }
    //Check if the emoji can be used
    let givenEmojiID = args[3].split(":")[2].replace(">", "");
    let availableEmojis = message.client.emojis.cache.filter(emoji => emoji.available).filter(emoji => emoji.id == givenEmojiID);
    if (availableEmojis.array().length == 0) { message.reply("Emoji is not accessible by the bot, check if it's from a server the bot is in."); return; }
    //Get the name and make it lowercase
    let givenName = "";
    for (let i = 4; i < args.length; i++) 
        if (args[i] != '')
            givenName += args[i] + " ";
    givenName = givenName.slice(0, -1).toLowerCase();
    //Check if a figure with the same name exists
    let nameCheck = await wrapper.getFigureByName(givenName);
    if (nameCheck != null) { message.reply("Figure with the same name already exists."); return; }
    //Check if a figure with the same emoji exists
    let emojiCheck = await wrapper.getFigureByEmojiID(givenEmojiID);
    if (emojiCheck != null) { message.reply("Figure with the same emoji already exists."); return; }
    //Add Figure to the database
    figure = await wrapper.newFigure(givenEmojiID, givenName);
    //Notify user and Log command
    let emoji = message.client.emojis.cache.get(givenEmojiID);
    message.reply("Successfully added " + `${emoji} ${givenName}` + " !");
    Helpers.log(message, "Figure Links", "New Figure Link!", `Figure ${givenName} has been linked with ${emoji} !`, "#4bde64");
}

exports.unlink = async function (message, args) {
    //Check for permission
    if (!Helpers.isMod(message)) return;
    //Check for enough args
    if (args.length < 4) { message.reply("Too few arguments"); return; }

    //Get the name and make it lowercase
    let givenName = "";
    for (let i = 3; i < args.length; i++)
        if (args[i] != '')
            givenName += args[i] + " ";
    givenName = givenName.slice(0, -1).toLowerCase();
    let f = await wrapper.getFigureByName(givenName);
    //If found, remove, if not search by emoji
    if (f != null) {
        //Remove the figure
        await wrapper.removeFigureByID(f._id);
        //Notify and Log
        let emoji = message.client.emojis.cache.get(f.emojiID);
        message.reply("Successfully removed " + `${emoji} ${f.name}` + " !");
        Helpers.log(message, "Figure Links", "Removed Figure Link!", `Figure ${f.name} has been unlinked from ${emoji} !`, "#de4b4b");
    } else {
        //Compute emojiID
        let givenEmojiID = args[3].replace(">", "").split(":")[2];
        let f = await wrapper.getFigureByEmojiID(givenEmojiID);
        if (f == null) { message.reply("Figure not found."); return; }
        //Remove the figure
        await wrapper.removeFigureByID(f._id);
        //Notify user and Log command
        let emoji = message.client.emojis.cache.get(givenEmojiID);
        message.reply("Successfully removed " + `${emoji} ${f.name}` + " !");
        Helpers.log(message, "Figure Links", "Removed Figure Link!", `Figure ${f.name} has been unlinked from ${emoji} !`, "#de4b4b");
    }
}

exports.addRule = async function (message, args) {
    if (!Helpers.isAdmin(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    // Check if the exact amount of args were given
    if (args.length > 5) { message.reply("Too many arguments."); return; }
    if (args.length < 5) { message.reply("Too few arguments."); return; }
    //Check if only one role was mentioned
    if (!message.mentions.roles.first()) { message.reply("No role mentioned. Make sure to @ the role."); return; }
    if (message.mentions.roles.array().length > 1) { message.reply("Too many roles mentioned. Only @ one role."); return; }
    //Check if rule exists
    let rankID = message.mentions.roles.first().id;
    try {
        await wrapper.newRule(rankID, args[4]);
        message.reply("Successfully updated the rules. Now the " + `<@&${rankID}>` + " role requires " + args[4] + " figures.");
        Helpers.log(message, "Collection Rank Rules", "Successfully updated the rules.", "Now the " + `<@&${rankID}>` + " role requires " + args[4] + " figures.", "#4bde64");
    } catch (err) {
        console.err(err);
    }
    
}

exports.removeRule = async function (message, args) {
    if (!Helpers.isAdmin(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    // Check if the exact amount of args were given
    if (args.length > 4) { message.reply("Too many arguments."); return; }
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    //Check if only one role was mentioned
    if (!message.mentions.roles.first()) { message.reply("No role mentioned. Make sure to @ the role."); return; }
    if (message.mentions.roles.array().length > 1) { message.reply("Too many roles mentioned. Only @ one role."); return; }
    //Check if rule exists
    let rankID = message.mentions.roles.first().id;
    await wrapper.removeRuleByRoleID(rankID);
    message.reply("Successfully updated the rules. Now the " + `<@&${rankID}>` + " role can't be obtained with figures.");
    Helpers.log(message, "Collection Rank Rules", "Successfully updated the rules.", "Now the " + `<@&${rankID}>` + " role can't be obtained with figures.", "#de4b4b");
}

exports.addFromCode = async function (message, args) {
    let bkm = message;
    message.delete();
    // Check if the exact amount of args were given
    if (args.length > 3) { message.reply("Too many arguments."); return; }
    if (args.length < 3) { message.reply("Too few arguments."); return; }
    
    //Check if code has been used
    let code = args[2];
    let figs = await wrapper.getOwnedFiguresByCode(code);
    if (figs.length != 0) {
        //IF yes stop
        bkm.reply("Code already used, nice try tho.");
        Helpers.log(bkm, "Collection", "Already used code!", "User tried to reuse a code. \nCode: " + code, "#de4b4b");
        return;
    }
    //ELSE get figures
    figs = await this.getFiguresFromCode(args[2]);
    if (figs == undefined || figs.length == 0) { bkm.reply("Invalid Code."); return;}
    let fig_ids = [];
    for (let i = 0; i < figs.length; i++) {
        let f = await wrapper.getFigureByName(figs[i].toLowerCase());
        if (f == null) continue;
        fig_ids.push([f._id, figs[i]]);
    }
    let uID = bkm.author.id;
    let addedFigs = "";
    //add to collection
    for (let i = 0; i < fig_ids.length; i++) {
        await wrapper.newOwnedFigure(uID, fig_ids[i][0], code);
        addedFigs += fig_ids[i][1] + ", ";
    }
    addedFigs = addedFigs.slice(0, -2);
    //notify and log
    bkm.reply("Added " + addedFigs);
    Helpers.log(bkm, "Collection", "New figure(s) added!", "Added " + addedFigs + " in user's collection.", "#4bde64");
    this.checkForRoles(bkm, message.author);
}

exports.push = async function (message, args) {
    if (!Helpers.isMod(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    // Check if the exact amount of args were given
    if (args.length > 4) { message.reply("Too many arguments."); return; }
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    //Check if only one role was mentioned
    if (!message.mentions.users.first()) { message.reply("No users mentioned. Make sure to @ the user."); return; }
    if (message.mentions.users.array().length > 1) { message.reply("Too many users mentioned. Only @ one user."); return; }
    //Check if rule exists
    let user = message.mentions.users.first();

    let fig = await wrapper.getFigureByName(args[2].toLowerCase());
    if (fig == null) {
        message.reply("Figure not found.");
        return;
    }

    let found = await wrapper.getOwnedFiguresByFigureID(fig.id, user.id);
    if (found.length != 0) {
        message.reply(user.username + " already has " + fig.name + " in his collection.");
        return;
    }

    wrapper.newOwnedFigure(user.id, fig._id, "pushed").then(() => {
        message.react('👍');
        Helpers.log(message, "Collection", "New figure(s) added!", "Added " + fig.name + " in <@" + user.id + ">'s collection.", "#4bde64");
        this.checkForRoles(message, user);
    });
}

exports.remove = async function (message, args) {
    if (!Helpers.isMod(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    // Check if the exact amount of args were given
    if (args.length > 4) { message.reply("Too many arguments."); return; }
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    //Check if only one role was mentioned
    if (!message.mentions.users.first()) { message.reply("No users mentioned. Make sure to @ the user."); return; }
    if (message.mentions.users.array().length > 1) { message.reply("Too many users mentioned. Only @ one user."); return; }
    //Check if rule exists
    let user = message.mentions.users.first();

    let fig = await wrapper.getFigureByName(args[2].toLowerCase());
    if (fig == null) {
        message.reply("Figure not found.");
        return;
    }

    let found = await wrapper.getOwnedFiguresByFigureID(fig.id, user.id);
    if (found.length == 0) {
        message.reply(user.username + " doesn't have " + fig.name + " in his collection.");
        return;
    }

    wrapper.removeOwnedFigureByFigureIDFromUser(fig._id, user.id,).then(() => {
        message.react('👍');
        Helpers.log(message, "Collection", "Figure(s) removed!", "Removed " + fig.name + " from <@" + user.id + ">'s collection.", "#de4b4b");
        this.checkForRoles(message, user);
    });
}

exports.show = async function (message, args) {
    let collection = await wrapper.getOwnedFiguresByUserID(message.author.id);
    if (collection.length == 0) {
        message.reply("Your collection is empty.");
        return;
    }

    let msg = "Total: " + collection.length + " Figures\n" + message.author.username + "'s Collection: \n\n";
    message.channel.send(msg);
    msg = "";
    for (let i = 0; i < collection.length; i++) {
        let fig = await wrapper.getFigureByID(collection[i].figureID);
        if (fig == null) continue;
        let emoji = message.client.emojis.cache.get(fig.emojiID);
        if (emoji != null) msg += `${emoji} `;
        else msg += 'NaN ';
        if ((i + 1) % 10 == 0 && i + 1 != figures.length) {
            msg += "\n-------------------------------------------\n";
            message.channel.send(msg);
            msg = "";
        }
    }
    msg += "\n-------------------------------------------";
    message.channel.send(msg);
}

/**
 * Get the figures from the code using the api
 * 
 * @param {string} code
 * 
 * @returns {Array<string>} Array of Figure names
 */
exports.getFiguresFromCode = async (code) => {
    //Link code to url
    var url = checker_url + code;

    //Get figure names
    let getinfo = async () => {
        let response = await axios.get(url);
        let info = response.data;
        return info;
    }

    let value = await getinfo().catch();
    if (!value)
        return;
    //Make name array
    let figures = [];
    for (var i = 0; i < value.names.length; i++) {
        figures[i] = value.names[i].replace(" ", "");
    }
    return figures;
}

exports.checkForRoles = async (message, user) => {
    //Get guild member
    let member = message.guild.member(user);
    //Get user figures and ruleset
    let figs = await wrapper.getOwnedFiguresByUserID(user.id);
    let rules = await wrapper.getRules();
    //Go through rules
    for (let i = 0; i < rules.length; i++) {
        //Get guild role
        let role = message.guild.roles.cache.get(rules[i].roleID);
        //If user meets role requirements
        if (rules[i].figureCount <= figs.length) {
            //Give user the role
            member.roles.add(role).catch(console.error);

            let embed = new Discord.MessageEmbed();
            embed.setColor(role.color);
            embed.setAuthor(user.tag, user.avatarURL());
            embed.setTitle("Congratulations you are now a " + role.name + "!");
            embed.setTimestamp();

            message.channel.send(embed);
            Helpers.log(message, "Ranks", "Role condition met", user.username + " is now a <@&" + role.id + "> !");
        } else {
            if (member.roles.cache.has(rules[i].roleID)) {
                member.roles.remove(role).catch(console.error);

                let embed = new Discord.MessageEmbed();
                embed.setColor("#de4ba8");
                embed.setAuthor(user.tag, user.avatarURL());
                embed.setTitle("Unfortunately you are no longer a " + role.name + ".");
                embed.setTimestamp();

                message.channel.send(embed);
                Helpers.log(message, "Ranks", "Role condition not met", user.username + " is no longer a <@&" + role.id + "> !");
            }
        }
    }
}