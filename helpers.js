const Discord = require("discord.js");
const fs = require("fs");
const RequestsTools = require("./requests_node/tools");
const CollectionsTools = require("./collections_node/tools");
const WikiTools = require("./wiki_node/tools");

//#region [Function] Check if message is a command
/**
 * Check if the message is a command.
 * 
 * @param {Discord.Message} message Discord Message Object
 * @param {string}          prefix  Command Prefix
 * 
 * @returns {boolean} Boolean
 */
exports.isCommand = function (message, prefix) {

    //Reject messages from other bots
    if (message.author.bot) return false;

    //Check if prefix is valid
    let contentPrefix = message.content.substr(0, prefix.length);
    let correctPrefix = (contentPrefix.localeCompare(prefix) == 0);

    //Reject message with wrong or no prefix
    if (!correctPrefix) return false;

    //Approve
    return true;
}
//#endregion

//#region [Function] logger

/**
 * Log command to all log chats.
 * 
 * This replaces the old Helpers.botLogCommand and Helpers.logCommand
 * 
 * @param {Discord.Message} message
 * @param {string} category
 * @param {string} title
 * @param {string} color
 * @param {string} description
 */
exports.log = function (message, category, title, description = "", color = "#de4ba8") {
    //Get message author
    let user = message.author;
    //Setup Embed
    let embed = new Discord.MessageEmbed()
        .setAuthor(user.tag, user.avatarURL())
        .setTitle(title)
        .setTimestamp()
        .setFooter(category)
        .setColor(color);
    //If a description is added, add it to the embed
    if (description.length > 0) {
        embed.setDescription(description);
    }
    //Get the work channels
    let channels = global.config.WORK_CHANNELS;
    //Loop through them
    for (let i = 0; i < channels.length; i++) {
        //Check only on log channels
        if (channels[i].purpose != "log") continue;
        //Get the actual channel
        try {
            let ch = message.guild.channels.cache.find(channel => channel.id === channels[i].id);
            //If it doesn't exist, report to console and go to next channel
            if (ch == undefined) {
                console.warn("Missing Log channel " + channels[i].name + " with purpose " + channels[i].purpose + "!");
                continue;
            }
            //Otherwise send log
            ch.send(embed);
        } catch (err) {
            //console.err(err);
        }
    }
}
//#endregion

//#region [Function] save and reload config
exports.saveConfig = async function () {
    const configFilePath = './config.json';
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(global.config, null, 4));
        global.config = JSON.parse(fs.readFileSync(configFilePath));
    } catch (err) { console.error(err) }
}
exports.reloadConfig = async function () {
    const configFilePath = './config.json';
    try {
        global.config = JSON.parse(fs.readFileSync(configFilePath));
    } catch (err) { console.error(err) }
}
//#endregion

//#region [Function] check if user can speak in current channel
/**
 * Check if user can speak in channel, optional: notify the user if he can't speak there.
 * 
 * @param {Discord.Message} message
 * @param {boolean} notify
 * 
 * @returns {boolean}
 */
exports.canSpeakInChannel = function (message, notify = false) {
    //If user is mod or admin, bypass
    if (this.isMod(message)) return true;
    //Get all registered channels
    let channels = global.config.WORK_CHANNELS;
    //Check if current channel is registered
    let channel = channels.find(ch => ch.id == message.channel.id);
    //If channel is not register then the user can speak
    if (channel == undefined) return true;
    //Get user roles
    let userRoles = message.member.roles.cache;
    //Check user roles agains the roles that can speak in the current channel
    let roleMatch = userRoles.some(r => channel.canSpeak.indexOf(r.id) >= 0);
    //If the role is in the list, user can speak
    if (roleMatch) return true;
    //If not, user can't speak
    //Check if the bot should notify the user about this
    if (notify) message.author.send("Hey! You can't speak in <#" + channel.id + ">");
    return false;
}
//#endregion

//#region [Function] check if user ran command in right chanel

exports.correctChannelUsed = function (message, purpose, notify = true) {
    //If user is mod or admin, bypass
    if (this.isMod(message)) return true;
    //Get all registered channels
    let channels = global.config.WORK_CHANNELS;
    //Check if current channel is registered
    let channel = channels.find(ch => ch.id == message.channel.id);
    //If channel is not register then the user can speak
    if (channel == undefined) {
        //Get purposed channels;
        let pc = "";
        for (let ch of channels) {
            if (ch.purpose.localeCompare(purpose) == 0) pc += "<#" + ch.id + "> ";
        }
        if (pc == "") pc = "No channels available.";
        //Check if the bot should notify the user about this
        if (notify) message.reply("Hey! You can't use " + purpose + " commands in <#" + message.channel.id + ">\nInstead run the command in " + pc).then(r => r.delete({ timeout: 5000 }).then(message.delete()));
        return false;
    }
    //If channel matches purpose, approve
    if (channel.purpose.localeCompare(purpose) == 0) return true;
    //Get purposed channels;
    let pc = "";
    for (let ch of channels) {
        if (ch.purpose.localeCompare(purpose) == 0) pc += "<#" + ch.id + "> ";
    }
    if (pc == "") pc = "No channels available.";
    //Check if the bot should notify the user about this
    if (notify) message.reply("Hey! You can't use " + purpose + " commands in <#" + channel.id + ">\nInstead run the command in " + pc).then(r => r.delete({ timeout: 5000 }).then(message.delete() ) );
    return false;
}

//#endregion

//#region [Function] send error to g3's dms
/**
 * Send dm to G3 with the error
 * 
 * @param {Discord.Message} message
 * @param {string} err
 */
exports.reportErrorToG3ru1a = function (message, err) {
    let g3 = message.client.users.cache.get("182520880277094400");
    g3.send("There was an error in channel " + message.channel + " in guild " + message.guild);
    g3.send("ERROR ```" + err + "```");
}
//#endregion

//#region [Function] Check if message author is administrator
/**
 * Check if the message author is an Administrator.
 *
 * @param {Discord.Message} message Discord Message object
 *
 * @returns {boolean} Boolean
 */
exports.isAdmin = function (message) {
    //Approve if user has "manage server" perm
    let member = message.member;
    if (member == null) return false;
    if (message.member.hasPermission('MANAGE_GUILD')) return true;
    //Check for admin role
    let admin_roles = global.config.ADMIN_ROLES;
    for (let i = 0; i < admin_roles.length; i++) {
        if ((message.member.roles).cache.find(r => r.id === admin_roles[i])) return true;
    }
    return false;
}
//#endregion

//#region [Function] Check if message author is moderator
/**
 * Check if the message author is a Moderator.
 * 
 * @param {Discord.Message} message Discord Message object
 * 
 * @returns {boolean} Boolean
 */
exports.isMod = function (message) {
    //Approve if admin
    if (this.isAdmin(message)) return true;
    let member = message.member;
    if (member == null) return false;
    //Check for mod role
    let mod_roles = global.config.MOD_ROLES;
    for (let i = 0; i < mod_roles.length; i++) {
        if ((message.member.roles).cache.find(r => r.id === mod_roles[i])) return true;
    }
    return false;
}
//#endregion

//#region [Function] Check how similar two strings are
/**
 * Check how similar two strings are.
 * 
 * @param {string} s1 First string
 * @param {string} s2 Second String
 * 
 * @returns {number} How similar the strings are, number from 0 to 1.
 */
exports.similarity = function (s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - module.exports.editDistance(longer, shorter)) / parseFloat(longerLength);
}
exports.editDistance = function (s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
//#endregion

//#region [Function] Show help menu
/**
 * Display help menu for user
 *
 * @param {Discord.Message} message Discord Message object
 *
 */
exports.showHelpMenu = async function (message) {
    let commandPrefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Help", message.guild.me.user.avatarURL());
    embed.addField("📦 Show collection help", "`" + commandPrefix + "collection help`");
    embed.addField("‼️ Show requests help", "`" + commandPrefix + "request help`");
    embed.addField("📕 Show wiki help", "`" + commandPrefix + "wiki help`");
    if (this.isAdmin(message)) {
        embed.addField('\u200b', "Admin Commands");
        embed.addField("Show configuration help", "`" + commandPrefix + "config help`");
    }
    embed.setColor(0xFF467F);
    embed.setTimestamp();
    embed.setFooter("Help Menu");
    let rep = await message.channel.send(embed);

    await rep.react('📦').then(r => {
        rep.react('‼️').then(r => {
            rep.react('📕');
        });
    });

    let filter = (reaction, user) => user.id == message.author.id;

    let collector = rep.createReactionCollector(filter, { time: 60000 });

    collector.on('collect', async (reaction, user) => {
        let col = reaction;
        if (col.emoji.name == '📦') {
            await CollectionsTools.showHelpMenu(message);
            collector.stop();
        }
        if (col.emoji.name == '‼️') {
            await RequestsTools.showHelpMenu(message);
            collector.stop();
        }
        if (col.emoji.name == '📕') {
            await WikiTools.showHelpMenu(message);
            collector.stop();
        }
    });

    collector.on('end', collected => {
        rep.delete();
    });
}
//#endregion