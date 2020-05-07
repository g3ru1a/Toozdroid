const Discord = require("discord.js");
const wrapper = require("./wrapper");
const Helpers = require("../helpers");

//#region Func. Show help embed
exports.showHelpMenu = function (message) {
    let prefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Collection Help", message.guild.me.user.avatarURL());
    embed.setDescription("Aliases: `" + prefix + "col` or `" + prefix + "collection`");
    embed.addField("Reload config, any unsaved changes will be lost.", "`" + prefix + "config reload`", true);
    embed.addField("Save changes to config file.", "`" + prefix + "config save`", true);
    embed.addField("Toggle 'allow figure duplicates'.", "`" + prefix + "config dupes`", true);
    embed.addField("Toggle 'allow users to reuse codes'.", "`" + prefix + "config reuse-codes`", true);
    embed.addField("Change prefix.", "`" + prefix + "config prefix <newPrefix>`", true);
    embed.addField("Edit mod list.", "`" + prefix + "config mod [add/remove] <@rank>`", true);
    embed.addField("Edit admin list.", "`" + prefix + "config admin [add/remove] <@rank>`", true);
    embed.addField("Edit log channel list.", "`" + prefix + "config log-chat [add/remove] <#channel>`", true);
    embed.addField("Edit log channel speakers list.", "`" + prefix + "config log-chat-speak [add/remove] <#channel> <@role>`", true);
    embed.addField("Show Overview of the config file.", "`" + prefix + "config overview`");
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