const Discord = require("discord.js");
const fs = require("fs");

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
        let ch = message.guild.channels.cache.find(channel => channel.id === channels[i].id);
        //If it doesn't exist, report to console and go to next channel
        if (ch == undefined) {
            console.warn("Missing Log channel " + channels[i].name + " with purpose " + channels[i].purpose + "!");
            continue;
        }
        //Otherwise send log
        ch.send(embed);
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