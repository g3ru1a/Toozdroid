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
exports.logCommand = function (message, category, title, description = "", color = "#de4ba8") {
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
    let logChannels = global.config.LOG_CHS;
    for (let i = 0; i < logChannels.length; i++) {
        let ch = message.guild.channels.cache.find(channel => channel.id === logChannels[i].id);
        if (ch == undefined) {
            console.warn("Missing Log channel with id:" + logChannels[i].name + "!");
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