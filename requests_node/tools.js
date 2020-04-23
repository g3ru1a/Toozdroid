const Discord = require("discord.js");
const Helpers = require("../helpers");
const FigureRequest = require('./RequestSchema');
const FigureRequestVote = require('./RequestVotesSchema');


exports.vote = async function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments.").then(r => r.delete({ timeout: 5000 }).then( () => message.delete() )); return; }
    //Get full name
    let givenName = "";
    for (let i = 2; i < args.length; i++) givenName += args[i] + " ";
    //Check if a request with a similar name has been made
    let foundRequests = await this.lookForRequests(givenName);
    //If similar requests have been found
    if (foundRequests) {
        //Loop through them and check if user did mean one of those
        for (request of foundRequests) {
            let approved = await this.checkRequest(message, request);
            let alreadyVoted = await this.alreadyVoted(message, request);
            console.log(approved, alreadyVoted, request._id);
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

exports.voteRequest = async function (message, request) {
    //Create vote
    const vote = new FigureRequestVote({
        requestID: request._id,
        voterID: message.author.id
    });
    await vote.save().catch();
    //Update vote count in request
    await FigureRequest.findByIdAndUpdate(request._id, { votes: (request.votes + 1) });
    message.reply("Successfully voted for " + request.name + "!");
    Helpers.log(message, "Figure Requests", "New Vote!", "Voted for request " + request.name + ".", "#4bde64");
}

exports.alreadyVoted = async function (message, request) {
    let found = await FigureRequestVote.find({ requestID: request._id, voterID: message.author.id });
    console.log(found);
    return (found.length > 0) ? true : false;
}

exports.createRequest = async function (message, requestName) {
    //Check if perfect fit is found
    if (this.checkPerfectFit(requestName)) return;
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
    message.reply("You successfully added the request for " + requestName + "!");
    Helpers.log(message, "Figure Requests", "Added Request!", "Created request for " + requestName + ".", "#4bde64");
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
    for (let i = 0; i < figs.length; i++) {
        let sim = Helpers.similarity(givenName, figs[i].name);
        if (sim > 0.5) {
            dblcheck.push(figs[i]);
        }
    }
    return (dblcheck.length > 0) ? dblcheck : null;
}

exports.checkPerfectFit = async function (givenName) {
    let figs = await FigureRequest.find();
    for (let i = 0; i < figs.length; i++) {
        let sim = Helpers.similarity(givenName, figs[i].name);
        if (sim == 1) return true
    }
    return false;
}