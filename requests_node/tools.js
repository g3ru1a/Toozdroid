const Discord = require("discord.js");
const Helpers = require("../helpers");
const FigureRequest = require('./RequestSchema');
const FigureRequestVote = require('./RequestVotesSchema');

exports.vote = async function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then( () => message.delete() )); return; }
    //Get full name
    let givenName = "";
    for (let i = 2; i < args.length; i++) givenName += args[i] + " ";
    givenName = givenName.slice(0, -1);
    //Check if a request with a similar name has been made
    let foundRequests = await this.lookForRequests(givenName);
    //If similar requests have been found
    if (foundRequests) {
        //Loop through them and check if user did mean one of those
        for (request of foundRequests) {
            let approved = await this.checkRequest(message, request);
            let alreadyVoted = await this.alreadyVoted(message, request);
            if (approved && !alreadyVoted) {
                this.voteRequest(message, request);
                return;
            }
            else if (approved && alreadyVoted) {
                message.reply("You already voted for " + request.name).then(r => r.delete({ timeout: 5000 }));
                return;
            }
        }
        //If no existing request was approved, create a new one
        this.createRequest(message, givenName);
    } else {
        //Add Request
        this.createRequest(message, givenName);
    }
}

exports.unvote = async function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }
    //Get full name
    let givenName = "";
    for (let i = 2; i < args.length; i++) givenName += args[i] + " ";
    givenName = givenName.slice(0, -1);
    //Check if a request with a similar name has been made
    let foundRequests = await this.lookForRequests(givenName);
    //If similar requests have been found
    if (foundRequests) {
        //Loop through them and check if user did mean one of those
        for (request of foundRequests) {
            let approved = await this.checkRequest(message, request);
            let alreadyVoted = await this.alreadyVoted(message, request);
            if (approved && alreadyVoted) {
                this.unvoteRequest(message, request);
                return;
            }
            else if (approved && !alreadyVoted) {
                message.reply("You didn't vote for " + request.name).then(r => r.delete({ timeout: 5000 }));
                return;
            }
        }
        //No requests with that name found, notify
        message.reply("No other requests that match " + givenName + " have been found.");
    } else {
        //No requests with that name found, notify
        message.reply("No requests that match " + givenName + " have been found.");
    }
}

exports.removeVotes = async function (message, args) {
    if (!Helpers.isMod(message)) return;
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }
    //Get full name
    let givenName = "";
    for (let i = 2; i < args.length; i++) givenName += args[i] + " ";
    givenName = givenName.slice(0, -1);
    //Check if a request with a similar name has been made
    let foundRequests = await this.lookForRequests(givenName);
    //If similar requests have been found
    if (foundRequests) {
        //Loop through them and check if user did mean one of those
        for (request of foundRequests) {
            let approved = await this.checkRequest(message, request);
            if (approved) {
                this.removeRequest(message, request);
                return;
            }
        }
        //No requests with that name found, notify
        message.reply("No other requests that match " + givenName + " have been found.");
    } else {
        //No requests with that name found, notify
        message.reply("No requests that match " + givenName + " have been found.");
    }

}

exports.showRank = async function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }
    //Get full name
    let givenName = "";
    for (let i = 2; i < args.length; i++) givenName += args[i] + " ";
    givenName = givenName.slice(0, -1);
    //Check if a request with a similar name has been made
    let foundRequests = await this.lookForRequests(givenName);
    //If similar requests have been found
    if (foundRequests) {
        //Loop through them and check if user did mean one of those
        for (request of foundRequests) {
            let approved = await this.checkRequest(message, request);
            if (approved) {
                await this.getRank(message, request).then(rank => {
                    if (rank == null) { message.reply("Something went wrong."); return; }
                    
                    let embed = new Discord.MessageEmbed()
                        .setAuthor("Toozdroid | Figure Requests", message.guild.me.user.avatarURL())
                        .setTitle(request.name + " is placed #" + rank)
                        .setDescription("It has " + request.votes + " votes.\nFirst requested by " + request.createdby + "!");
                    if (rank == 1) embed.setColor("#FFD700");
                    else if (rank == 2) embed.setColor("#C0C0C0");
                    else if (rank == 3) embed.setColor("#CD7F32");
                    else if (rank == 69) {
                        embed = new Discord.MessageEmbed()
                            .setAuthor("😂Toozdroid😂|😂Figure😂Requests", message.guild.me.user.avatarURL())
                            .setTitle(request.name + "😂is😂placed😂#" + rank + "😂")
                            .setDescription("It😂has😂" + request.votes + "😂votes.\nFirst😂requested😂by😂" + request.createdby + "😂!😂");
                        embed.setColor("#FFD700");
                    }
                    else if (rank == 420) {
                        embed = new Discord.MessageEmbed()
                            .setAuthor("🚬Toozdroid🚬|🚬Figure🚬Requests", message.guild.me.user.avatarURL())
                            .setTitle("woahh man..." + request.name + " is #" + rank)
                            .setDescription("thats like...the weed number.. woah..\nit's got like " + request.votes + " votes... damn...\n" + request.createdby + " said it first...thanks dude.......");
                        embed.setColor("#499B4A");
                    }
                    else if (rank == 1337) {
                        embed = new Discord.MessageEmbed()
                            .setAuthor("😎Toozdroid😎|😎Figure😎Requests", message.guild.me.user.avatarURL())
                            .setTitle(request.name + "😎is😎placed😎#" + rank + "😎")
                            .setDescription("It😎has😎" + request.votes + "😎votes.\nFirst😎requested😎by😎" + request.createdby + "😎!😎");
                        embed.setColor("#000000");
                    }
                    else embed.setColor("#ff4669");
                    message.reply(embed);
                    return;
                });
                return;
            }
        }
        //No requests with that name found, notify
        message.reply("No other requests that match " + givenName + " have been found.");
    } else {
        //No requests with that name found, notify
        message.reply("No requests that match " + givenName + " have been found.");
    }

}

exports.showTop = async function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }
    if (args[2] < 1) { message.reply("Can't show less than one figure.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }

    let requests = await this.getRankedArray();
    if (requests.length == 0) { message.reply("There are no requests. Nothing to show.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }

    let page = 1, perPage = 5;
    let embed = this.getTopPageEmbed(page, perPage, requests, message, args[2]);
    let maxPage = Math.ceil(requests.length / perPage);
    let rep = await message.reply(embed);
    let authorID = message.author.id;

    if (args[2] > 5) {
        // Reacts so the user only have to click the emojis
        await rep.react('⬅').then(r => {
            rep.react('➡').then(rr => {
                rep.react('❌');
            });
        });
        let error = null;
        let parent = this;
        while (error == null) {
            // First argument is a filter function
            await rep.awaitReactions((reaction, user) => user.id == authorID && (reaction.emoji.name == '⬅' || reaction.emoji.name == '➡' || reaction.emoji.name == '❌'),
                { max: 1, time: 120000 }).then(async function (collected) {
                    let col = collected.first();
                    if (col == undefined) return;
                    if (col.emoji.name == '❌') {
                        col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                        error = "crack";
                        return;
                    } else if (col.emoji.name == '⬅') {
                        if (page <= 1) {
                            col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                            return;
                        }
                        page--;
                    }
                    else {
                        if (page >= maxPage) {
                            col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                            return;
                        }
                        page++;
                    }
                    let embed = parent.getTopPageEmbed(page, perPage, requests, message, args[2]);
                    await rep.edit(embed);
                    col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                }).catch();
        }
        rep.delete({ timeout: 10000 }).then(message.delete()).catch();
    }
}

exports.list = async function (message, args) {
    let page = 1, perPage = 5;
    if (args[2]) page = args[2];
    if (args[3]) perPage = args[3];
    if (page < 1) { message.reply("Can't show less than one figure per page.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }
    if (perPage < 1) { message.reply("There's no page below 1.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }

    let requests = await this.getRankedArray();
    if (requests.length == 0) { message.reply("There are no requests. Nothing to show.").then(r => r.delete({ timeout: 5000 }).then(() => message.delete())); return; }

    let embed = this.getPageEmbed(page, perPage, requests, message);
    let maxPage = Math.ceil(requests.length / perPage);
    let rep = await message.reply(embed);
    let authorID = message.author.id;
    // Reacts so the user only have to click the emojis
    await rep.react('⬅').then(r => {
        rep.react('➡').then(rr => {
            rep.react('❌');
        });
    });
    let error = null;
    let parent = this;
    while (error == null) {
        // First argument is a filter function
        await rep.awaitReactions((reaction, user) => user.id == authorID && (reaction.emoji.name == '⬅' || reaction.emoji.name == '➡' || reaction.emoji.name == '❌'),
            { max: 1, time: 120000 }).then(async function (collected) {
                let col = collected.first();
                if (col == undefined) return;
                if (col.emoji.name == '❌') {
                    col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                    error = "crack";
                    return;
                } else if (col.emoji.name == '⬅') {
                    if (page <= 1) {
                        col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                        return;
                    }
                    page--;
                }
                else {
                    if (page >= maxPage) {
                        col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
                        return;
                    }
                    page++;
                }
                let embed = parent.getPageEmbed(page, perPage, requests, message);
                await rep.edit(embed);
                col.message.reactions.cache.forEach(reaction => reaction.users.remove(authorID));
            }).catch();
    }
    rep.delete({ timeout: 10000 }).then(message.delete()).catch();
}

exports.showHelpMenu = function (message) {
    let prefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Figure Requests Help", message.guild.me.user.avatarURL());
    embed.setDescription("Aliases: `" + prefix + "req` or `" + prefix + "request`");
    embed.addField("Request/Vote for a figure.", "`" + prefix + "request vote <figureName>`", true);
    embed.addField("Remove vote for a figure.", "`" + prefix + "request unvote <figureName>`", true);
    embed.addField("Show Request Position and Info.", "`" + prefix + "request rank <figureName>`", true);
    embed.addField("Show top n figures.", "`" + prefix + "request top <n>`", true);
    embed.addField("List all requests. (? - optional argument)", "`" + prefix + "request list <page?> <perPage?>`", true);
    if (Helpers.isMod(message))
        embed.addField("Remove all requests for a figure.", "`" + prefix + "request remove <figureName>`", true);
    if (Helpers.isAdmin(message)) {
        embed.addField("Add/Remove request work channel.", "`" + prefix + "request chat <add/remove> <#channel>`", true);
        embed.addField("Add/Remove role speak perm to request work channel.", "`" + prefix + "request chat-speakers <add/remove> <#channel> <@role>`", true);
    }
    embed.setColor(0xFF467F);
    embed.setTimestamp();
    embed.setFooter("Figure Requests Help Menu");
    message.channel.send(embed);
}

//#region [Helper Functions]

exports.getTopPageEmbed = function (page, perPage, entries, message, n) {
    let from = Math.min(perPage * (page - 1), entries.length - 1);
    let to = Math.min(perPage * page, entries.length);
    to = Math.min(to, n);
    let maxPage = Math.ceil(entries.length / perPage);
    let embed = new Discord.MessageEmbed()
        .setAuthor("Toozdroid | Figure Requests", message.guild.me.user.avatarURL())
        .setTitle("Top " + n + " requests")
        .setTimestamp()
        .setFooter("Figure Requests Top Page " + page + "/" + maxPage)
        .setColor("#ff4669");
    for (let i = from; i < to; i++) {
        let rank = i + 1;
        let name = entries[i].name;
        if (rank == 1) rank = " 🥇";
        else if (rank == 2) rank = " 🥈";
        else if (rank == 3) rank = " 🥉";
        else rank = "#" + rank;
        embed.addField("Requested by " + entries[i].createdby, rank + " " + name);
    }
    return embed;
}

exports.getPageEmbed = function (page, perPage, entries, message) {
    let from = Math.min(perPage * (page - 1), entries.length - 1);
    let to = Math.min(perPage * page, entries.length);
    let maxPage = Math.ceil(entries.length / perPage);
    let embed = new Discord.MessageEmbed()
        .setAuthor("Toozdroid | Figure Requests", message.guild.me.user.avatarURL())
        .setTitle("Figure Requests list")
        .setTimestamp()
        .setFooter("Figure Requests Page " + page + "/" + maxPage)
        .setColor("#ff4669");
    for (let i = from; i < to; i++) {
        let rank = i + 1;
        let name = entries[i].name;
        if (rank == 1) rank = " 🥇";
        else if (rank == 2) rank = " 🥈";
        else if (rank == 3) rank = " 🥉";
        else rank = "#" + rank;
        embed.addField("Requested by " + entries[i].createdby, rank + " " + name);
    }
    return embed;
}

exports.getRank = async function (message, request) {
    let requests = await this.getRankedArray();

    let id = request._id.toString();
    for (let i = 0; i < requests.length; i++) {
        let req_id = requests[i]._id.toString();
        if (id.localeCompare(req_id) == 0) return i+1;
    }
    return null;
}

exports.getRankedArray = async function () {
    let requests = await FigureRequest.find();

    for (let i = 0; i < requests.length; i++)
        for (let j = i + 1; j < requests.length; j++)
            if (requests[i].votes < requests[j].votes) [requests[i], requests[j]] = [requests[j], requests[i]];
    return requests;
}

exports.removeRequest = async function (message, request) {
    //Find vote and delete it
    await FigureRequestVote.deleteMany({
        requestID: request._id
    });
    //Update vote count in request
    await FigureRequest.findByIdAndDelete(request._id);
    message.reply("Successfully removed votes for **" + request.name + "**!");
    Helpers.log(message, "Figure Requests", "All Votes Removed!", "Votes for request `" + request.name + "` has been removed.", "#de4b4b");
}

exports.unvoteRequest = async function (message, request) {
    //Find vote and delete it
    await FigureRequestVote.findOneAndDelete({
        requestID: request._id,
        voterID: message.author.id
    });
    //Update vote count in request
    await FigureRequest.findByIdAndUpdate(request._id, { votes: (request.votes - 1) });
    message.reply("Successfully removed vote for **" + request.name + "**!");
    Helpers.log(message, "Figure Requests", "Vote Removed!", "Vote for request `" + request.name + "` has been removed.", "#de4b4b");
    if (request.votes == 1) {
        await FigureRequest.findByIdAndDelete(request._id);
        Helpers.log(message, "Figure Requests", "All Votes Removed!", "Votes for request `" + request.name + "` has been removed.\nBecause it reached 0 votes.", "#de4b4b");
    }
}

exports.voteRequest = async function (message, request) {
    //Create vote
    const vote = new FigureRequestVote({
        requestID: request._id,
        voterID: message.author.id
    });
    await vote.save().catch();
    //Update vote count in request
    await FigureRequest.findByIdAndUpdate(request._id, { votes: (request.votes + 1) });
    message.reply("Successfully voted for **" + request.name + "**!");
    Helpers.log(message, "Figure Requests", "New Vote!", "Voted for request `" + request.name + "`.", "#4bde64");
}

exports.alreadyVoted = async function (message, request) {
    let found = await FigureRequestVote.find({ requestID: request._id, voterID: message.author.id });
    return (found.length > 0) ? true : false;
}

exports.createRequest = async function (message, requestName) {
    //Check if perfect fit is found
    let fit = await this.checkPerfectFit(requestName);
    if (fit == true) return;
    // Check if user wants to add
    let rep = await message.reply('Requests for figure **' + requestName + '** not found, do you want to add it? *Confirm with reaction*');
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
                rep.delete({ timeout: 2000 });
                return;
            }
            else {
                message.reply('Alright then.').then(r => r.delete({ timeout: 5000 }));
                approved = false;
                rep.delete({ timeout: 2000 });
                return;
            }
        }).catch(() => {
            message.reply('No reaction after 30 seconds, request canceled').then(r => r.delete({ timeout: 5000 }));
            rep.delete({ timeout: 2000 });
        });
    if (!approved) return;
    let user = message.author;
    //Create request and vote
    const request = new FigureRequest({
        name: requestName,
        createdby: user.username,
    });
    await request.save().catch();
    const vote = new FigureRequestVote({
        requestID: request._id,
        voterID: user.id
    });
    await vote.save().catch();
    message.reply("You successfully added the request for **" + requestName + "**!");
    Helpers.log(message, "Figure Requests", "Added Request!", "Created request for `" + requestName + "`.", "#4bde64");
}

exports.checkRequest = async function (message, request) {
    let rep = await message.reply('Did you mean **' + request.name + '** ? *Confirm with reaction*');
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
                rep.delete({ timeout: 2000 });
                return;
            }
            else {
                rep.edit('Okay.');
                approved = false;
                rep.delete({ timeout: 2000 });
                return;
            }
        }).catch(() => {
            rep.edit('No reaction after 30 seconds, looking for next request.').then(r => r.delete({ timeout: 2000 }));
        });
    return approved;
}

exports.lookForRequests = async function (givenName) {
    let figs = await FigureRequest.find();
    let dblcheck = [];
    let likeness = [];
    for (let i = 0; i < figs.length; i++) {
        let sim = Helpers.similarity(givenName, figs[i].name);
        if (sim > 0.5) {
            dblcheck.push(figs[i]);
            likeness.push(sim);
        }
    }
    for (let i = 0; i < likeness.length; i++) {
        for (let j = i; j < likeness.length; j++) {
            if (likeness[i] < likeness[j]) {
                let t = likeness[j];
                let tt = dblcheck[j];
                likeness[j] = likeness[i];
                dblcheck[j] = dblcheck[i];
                likeness[i] = t;
                dblcheck[i] = tt;
            }
        }
    }
    return (dblcheck.length > 0) ? dblcheck : null;
}

exports.checkPerfectFit = async function (givenName) {
    let figs = await FigureRequest.find();
    for (let i = 0; i < figs.length; i++) {
        if (givenName.toLowerCase().localeCompare(figs[i].name.toLowerCase()) == 0) return true;
    }
    return false;
}
//#endregion