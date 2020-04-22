const Discord = require("discord.js");

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
    let user = message.author;
    let embed = new Discord.MessageEmbed()
        .setAuthor(user.tag, user.avatarURL())
        .setTitle(title)
        .setTimestamp()
        .setFooter(category)
        .setColor(color);
    if (description.length > 0) {
        embed.setDescription(description);
    }
    let channels = global.config.WORK_CHANNELS;
    for (let i = 0; i < channels.length; i++) {
        if (channels[i].purpose != "log") continue;
        let ch = message.guild.channels.cache.find(channel => channel.id === channels[i].id);
        if (ch == undefined) {
            console.warn("Missing Log channel " + channels[i].name + " with purpose " + channels[i].purpose + "!");
            continue;
        }
        ch.send(embed);
    }
}
//#endregion

//#region [Function] save and reload config
exports.saveConfig = function () {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(global.config, null, 4));
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