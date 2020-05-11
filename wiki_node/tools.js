const Discord = require("discord.js");
const Helpers = require("../helpers.js");
const WikiEntry = require("./WikiSchema");


exports.showHelpMenu = async (message) => {
    let commandPrefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Wiki Help", message.guild.me.user.avatarURL());
    embed.addField("Show wiki info for a figure", "`" + commandPrefix + "wiki <FigureName>`", true);
    embed.addField("Show all the wiki figures", "`" + commandPrefix + "wiki list <Page (optional)> <ItemsPerPage (optional)>`", true);
    if (Helpers.isMod(message)) {
        embed.addField('\u200b', "Mod Commands");
        embed.addField("Adds figure to wiki", "`" + commandPrefix + "wiki add <FigureName>`", true);
        embed.addField("Removes figure from wiki", "`" + commandPrefix + "wiki remove <FigureName>`", true);
        embed.addField("Set figure status in wiki", "`" + commandPrefix + "wiki status <FigureName> <Status>`", true);
        embed.addField("Set figure description in wiki", "`" + commandPrefix + "wiki description <FigureName> <Description>`", true);
        embed.addField("Set figure author in wiki", "`" + commandPrefix + "wiki author <FigureName> <Author>`", true);
    }
    if (Helpers.isAdmin(message)) {
        embed.addField('\u200b', "Admin Commands");
        embed.addField("Add/Remove wiki work channel.", "`" + commandPrefix + "wiki chat <add/remove> <#channel>`", true);
        embed.addField("Add/Remove role speak perm to wiki work channel.", "`" + commandPrefix + "wiki chat-speakers <add/remove> <#channel> <@role>`", true);
    }
    embed.setColor(0xFF467F);
    embed.setTimestamp();
    embed.setFooter("Wiki Help Menu");
    message.channel.send(embed);
}

exports.add = async (message, args) => {
    // Check if the exact amount of args were given
    if (args.length > 3) { message.reply("Too many arguments."); return; }
    if (args.length < 3) { message.reply("Too few arguments."); return; }

    //Check if entry exists
    let fig = await WikiEntry.findOne({ name: args[2] });
    if (fig) {
        message.reply("Figure already exists in wiki");
        return;
    }

    let error = null;
    let questions = ["Price?", "Color?", "Image URL?", "Release Date?", "Status?", "Description?", "Author?"];
    let answers = [null, null, null, null, null, null, null];
    let index = 0;
    let endPoint = questions.length;
    let rep = await message.reply("Loading...");
    while (index < endPoint && error == null) {
        await rep.edit(questions[index]);
        await message.channel.awaitMessages(response => response.author.id == message.author.id,
            { max: 1, time: 120000 }).then(collected => {
                let response = collected.first();
                if (response.content.toLowerCase() == "cancel") { error = "Cancel command given"; return; };

                answers[index] = response.content;
                response.delete();
                index++;

            }).catch(() => {
                message.reply('No response after 2 minutes.');
                error = "No response cancel.";
            });
    }
    await rep.delete();
    if (error != null) {
        message.reply("Operation cancelled.");
        return;
    }

    let figure = {
        name: args[2],
        description: answers[5],
        imageurl: answers[2],
        price: answers[0],
        color: answers[1],
        releaseDate: answers[3],
        status: answers[4],
        author: answers[6]
    };

    let wikiEntry = new WikiEntry(figure);
    await wikiEntry.save().catch();
    message.reply("Figure added to wiki.");
    Helpers.log(message, "Wiki", "Added " + figure.name + " to the wiki.", "", "#4bde64");
}

exports.show = async (message, args) => {
    if (args.length > 2) { message.reply("Too many arguments."); return; }
    if (args.length < 2) { message.reply("Too few arguments."); return; }

    let name = await this.getCorrectFigureName(args[1]);
    let fig = await WikiEntry.findOne({ name: name });

    if (fig == null) {
        message.reply("Figure does not exists in wiki");
        return;
    }
    let youtoozLogoLink = "https://i.imgur.com/xzcxj6u.png";
    const embed = new Discord.MessageEmbed();
    embed.setTitle(fig.name);
    embed.setAuthor("Youtooz Collectibles | Wiki", youtoozLogoLink);
    embed.setThumbnail(youtoozLogoLink);
    embed.setDescription(fig.description);
    embed.addFields(
        { name: "Release Date", value: fig.releaseDate, inline: true },
        { name: "Status", value: fig.status, inline: true },
        { name: "Price", value: fig.price, inline: true }
    );
    embed.setImage(fig.imageurl);
    embed.setColor(fig.color);
    embed.setFooter("Description written by " + fig.author);

    message.channel.send(embed).catch(err => console.log(err));
}

exports.remove = async (message, args) => {
    if (args.length > 3) { message.reply("Too many arguments."); return; }
    if (args.length < 3) { message.reply("Too few arguments."); return; }

    let name = await this.getCorrectFigureName(args[2]);
    let fig = await WikiEntry.findOne({ name: name });
    if (fig) {

        let rep = await message.reply('Are you sure you want to delete **' + name + '** ? *Confirm with reaction*');
        // Reacts so the user only have to click the emojis
        await rep.react('👍').then(r => {
            rep.react('👎');
        });
        let approved = false;
        // First argument is a filter function
        await rep.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
            { max: 1, time: 30000 }).then(collected => {
                if (collected.first().emoji.name == '👍') {
                    approved = true;
                    return;
                }
                else {
                    message.reply('Okay.');
                    approved = false;
                    return;
                }
            }).catch(() => {
                message.reply('No reaction after 30 seconds, request canceled');
            });
        rep.delete();

        if (approved) {
            await WikiEntry.deleteOne({ name: name });
            message.reply("Successfully deleted " + name + " from the wiki.");
            Helpers.log(message, "Wiki", "Removed " + name + " from the wiki.", "", "#de4b4b");
        }

        return;
    } else {
        message.reply("Figure doesn't exists in wiki");
        Helpers.log(message, "Wiki", "**Tried** to remove " + args[2] + " from the wiki.", "", "#de4ba8");
        return;
    }
}

exports.setStatus = async (message, args) => {
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    let stat = "";
    for (let i = 3; i < args.length; i++) stat += args[i] + " ";
    let name = await this.getCorrectFigureName(args[2]);
    let fig = await WikiEntry.findOne({ name: name });
    if (fig) {
        await WikiEntry.findOneAndUpdate({ name: name }, { status: stat });
        message.reply("Successfully updated " + name + "'s status in the wiki.");
        Helpers.log(message, "Wiki", "Changed the status for " + name + " in the wiki to *" + stat + "*.", "", "#de4b4b");
        return;
    } else {
        message.reply("Figure doesn't exists in wiki");
        Helpers.log(message, "Wiki", "**Tried** to change the status for " + args[2] + " in the wiki to *" + stat + "*.", "", "#de4ba8");
        return;
    }
}

exports.setDescription = async (message, args) => {
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    let desc = "";
    for (let i = 3; i < args.length; i++) desc += args[i] + " ";
    let name = await this.getCorrectFigureName(args[2]);
    let fig = await WikiEntry.findOne({ name: name });
    if (fig) {
        await WikiEntry.findOneAndUpdate({ name: name }, { description: desc });
        message.reply("Successfully updated " + name + "'s description in the wiki.");
        Helpers.log(message, "Wiki", "Changed the description for " + name + " in the wiki to *" + desc + "*.", "", "#de4b4b");
        return;
    } else {
        message.reply("Figure doesn't exists in wiki");
        Helpers.log(message, "Wiki", "**Tried** to change the description for " + args[2] + " in the wiki to *" + desc + "*.", "", "#de4ba8");
        return;
    }
}

exports.setAuthor = async (message, args) => {
    if (args.length < 4) { message.reply("Too few arguments."); return; }
    let author = "";
    for (let i = 3; i < args.length; i++) author += args[i] + " ";
    let name = await this.getCorrectFigureName(args[2]);
    let fig = await WikiEntry.findOne({ name: name });
    if (fig) {
        await WikiEntry.findOneAndUpdate({ name: name }, { author: author });
        message.reply("Successfully updated " + name + "'s author in the wiki.");
        Helpers.log(message, "Wiki", "Changed the author for " + name + " in the wiki to *" + author + "*.", "", "#de4b4b");
        return;
    } else {
        message.reply("Figure doesn't exists in wiki");
        Helpers.log(message, "Wiki", "**Tried** to change the author for " + args[2] + " in the wiki to *" + author + "*.", "", "#de4ba8");
        return;
    }
}

exports.list = async (message, args) => {
    let page = 1;
    let perPage = 2;
    if (args[2]) page = args[2];
    if (args[3]) perPage = args[3];
    if (page < 1) {
        message.reply("There are no pages below 1.");
        return;
    }
    if (perPage < 1) {
        message.reply("Can't show less than 1 item per page.");
        return;
    }
    let entries = await WikiEntry.find();
    if (entries.length == 0) {
        message.reply("Wiki is empty, nothing to show.");
        return;
    }
    let embed = this.getWikiListPageEmbed(page, perPage, entries);
    let maxPage = Math.ceil(entries.length / perPage);
    let rep = await message.reply(embed);
    let authorID = message.author.id;
    message.delete();
    // Reacts so the user only have to click the emojis
    await rep.react('⬅').then(r => {
        rep.react('➡');
    });

    let filter = (reaction, user) => user.id == authorID && (reaction.emoji.name == '⬅' || reaction.emoji.name == '➡');

    let collector = rep.createReactionCollector(filter, { time: 5000 });

    collector.on('collect', async (reaction, user) => {
        let col = reaction;
        if (col.emoji.name == '⬅') {
            if (page <= 1) {
                col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                collector.resetTimer();
                return;
            }
            page--;
        }
        else {
            if (page >= maxPage) {
                col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                collector.resetTimer();
                return;
            }
            page++;
        }
        let embed = this.getWikiListPageEmbed(page, perPage, entries);
        await rep.edit(embed);
        col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
        collector.resetTimer();
    });

    collector.on('end', collected => {
        rep.delete().then(message.reply('No activity for 2 minutes, closing List.').then(r => r.delete({ timeout: 20000 })));
    });

   
}

exports.getWikiListPageEmbed = function (page, perPage, entries) {
    let pagesTotal = Math.ceil(entries.length / perPage);

    let embed = new Discord.MessageEmbed();
    embed.setTitle("Wiki List");
    embed.setAuthor("Youtooz Collectibles");
    embed.setColor(0xFF467F);
    embed.setThumbnail("https://i.imgur.com/xzcxj6u.png");
    let maxDescLength = 150;

    let from = Math.min(perPage * (page - 1), entries.length - 1);
    let to = Math.min(perPage * page, entries.length);

    for (let i = from; i < to; i++) {
        let desc = (entries[i].description.length > maxDescLength) ? entries[i].description.substring(0, maxDescLength) + "..." : entries[i].description;
        embed.addField("Released on: " + entries[i].releaseDate, "**" + entries[i].name + "** `[" + entries[i].status + "]`\n\n" + desc);
    }
    embed.setFooter("Page: " + page + "/" + pagesTotal);
    return embed;
}

exports.getCorrectFigureName = async function (givenName) {
    let figs = await WikiEntry.find();
    for (let i = 0; i < figs.length; i++) {
        let sim = Helpers.similarity(givenName, figs[i].name);
        if (sim > 0.85) return figs[i].name;
    }
    return null;
}