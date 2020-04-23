const Discord = require("discord.js");
const Helpers = require("../helpers");

//#region Func. Show Overview

exports.showOverview = function (message) {
    const embed = new Discord.MessageEmbed();
    let mods = "", admins = "";
    for (mod of global.config.MOD_ROLES) {
        mods += `<@&${mod}>\n`;
    }
    for (adm of global.config.ADMIN_ROLES) {
        admins += `<@&${adm}>\n`;
    }
    if (mods == "") mods = "No roles set.";
    if (admins == "") admins = "No roles set.";
    let c = global.config;
    embed.setAuthor("Config Overview", message.guild.me.user.avatarURL());
    embed.setDescription("Prefix is `" + c.PREFIX + "`\nCan Reuse Codes " + ((c.REUSE_CODES) ? '✅' : '❎') + "\nAllow Figure Duplicates " + ((c.ACC_DUPES) ? '✅' : '❎'));
    if (c.WORK_CHANNELS.length > 0) embed.addField('\u200b', '\u200b');
    for (channel of c.WORK_CHANNELS) {
        let speakers = "";
        for (sp of channel.canSpeak) {
            speakers += `<@&${sp}>\n`;
        }
        embed.addFields(
            { name: 'Channel', value: `<#${channel.id}>`, inline: true },
            { name: 'Purpose', value: channel.purpose, inline: true },
            { name: 'Speakers', value: speakers, inline: true });
    }
    embed.addField('\u200b', '\u200b');
    embed.addFields(
        { name: 'Admin List', value: admins, inline: true },
        { name: 'Mod List', value: mods, inline: true });
    embed.setColor(0xFF467F);
    embed.setTimestamp();
    embed.setFooter("Configuration Overview");
    message.channel.send(embed);
}

//#endregion

//#region Func. Show help embed
exports.showHelpMenu = function (message) {
    let prefix = global.config.PREFIX;
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Toozdroid Config Help", message.guild.me.user.avatarURL());
    embed.setDescription("Aliases: `" + prefix + "conf` or `" + prefix + "config`");
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

//#region Func Manage Log Chats Speakers

exports.manageLogChatSpeakers = function (message, args) {
    if (args.length < 5) {
        message.reply("Too few arguments");
        return;
    }

    //Use object literals
    function execute(command) {
        let fn;
        const options = {
            "add": function () {
                //Check if a chat and a role has been specified
                if (args.length > 5) { message.reply("Too many arguments").then(r => r.delete({ timeout: 5000 })); return; }
                //Strip id from argument
                let channelID = args[3].replace(/\D/g, '');
                //Get channel object if it exists
                let ch = message.guild.channels.cache.find(c => c.id == channelID);
                //If channel id is empty, has letters or the object doesn't exist, reject
                if (channelID == '' || (channelID.match(/[a-z]/i) && channelID.length < 1) || ch == undefined) {
                    message.reply("Invalid channel");
                    return;
                }
                //Get all channels
                let channels = global.config.WORK_CHANNELS;
                let found = false;
                let ind = -1;
                //Check if given channel is already in the config file as a log channel and keep index
                for (let i = 0; i < channels.length; i++) {
                    if (channels[i].purpose != "log") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as log channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Get mentioned role
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[4] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                //Add to array
                global.config.WORK_CHANNELS[ind].canSpeak.push(role.id);
                //Notify user and log
                message.reply("Successfuly added " + `${role}` + " to the <#" + channelID + "> speak perms!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Log", "Log Channels speak perms Updated", "Successfuly added " + `${role}` + " to the <#" + channelID + "> speak perms!", color = "#4bde64");
            },
            "remove": function () {
                //Check if a chat has been specified
                if (args.length > 5) { message.reply("Too many arguments").then(r => r.delete({ timeout: 5000 })); return; }
                //Strip id from argument
                let channelID = args[3].replace(/\D/g, '');
                //Get channel object if it exists
                let ch = message.guild.channels.cache.find(c => c.id == channelID);
                //If channel id is empty, has letters or the object doesn't exist, reject
                if (channelID == '' || (channelID.match(/[a-z]/i) && channelID.length < 1) || ch == undefined) {
                    message.reply("Invalid channel");
                    return;
                }
                //Get all channels
                let channels = global.config.WORK_CHANNELS;
                let found = false;
                let ind = -1;
                //Check if given channel is already in the config file as a log channel and keep index
                for (let i = 0; i < channels.length; i++) {
                    if (channels[i].purpose != "log") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as log channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Get mentioned role
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[4] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                //Remove channel from list
                let channel = channels[ind];
                global.config.WORK_CHANNELS[ind].canSpeak.splice(channel.canSpeak.indexOf(role.id), 1);
                //Notify user and log
                message.reply("Successfuly removed " + `${role}` + " from <#" + channelID + "> speak perms!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Log", "Log Channels speak perms Updated", "Successfuly removed " + `${role}` + " from <#" + channelID + "> speak perms!", color = "#de4b4b");
            },
            "default": function () {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "config help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}

//#endregion

//#region Func. Manage LogChats
/**
 * 
 * @param {Discord.Message} message
 * @param {any} args
 */
exports.manageLogChats = function (message, args) {
    if (args.length < 4) {
        message.reply("Too few arguments");
        return;
    }
    //Use object literals
    function execute(command) {
        let fn;
        const options = {
            "add": function () {
                //Check if a chat has been specified
                if (args.length > 4) { message.reply("Too many arguments").then(r => r.delete({ timeout: 5000 })); return; }
                //Strip id from argument
                let channelID = args[3].replace(/\D/g, '');
                //Get channel object if it exists
                let ch = message.guild.channels.cache.find(c => c.id == channelID);
                //If channel id is empty, has letters or the object doesn't exist, reject
                if (channelID == '' || (channelID.match(/[a-z]/i) && channelID.length < 1) || ch == undefined) {
                    message.reply("Invalid channel");
                    return;
                }
                //Get all channels
                let channels = global.config.WORK_CHANNELS;
                let found = false;
                //Check if given channel is already in the config file as a log channel
                for (channel in channels) {
                    if (channel.purpose != "log") continue;
                    if (channel.id == channelID) {
                        found = true;
                        break;
                    }
                }
                //If channel is already in the config, reject
                if (found) { message.reply("Channel already in config as log channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Create object
                let ch_obj = {
                    id: ch.id,
                    name: ch.name,
                    canSpeak: [],
                    purpose: "log"
                }
                //Add to array
                global.config.WORK_CHANNELS.push(ch_obj);
                //Notify user and log
                message.reply("Successfuly added <#" + ch_obj.id + "> to the log channels list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Log", "Log Channel list Updated", "Successfuly added <#" + ch_obj.id + "> to the log channels list!", color = "#4bde64");
            },
            "remove": function () {
                //Check if a chat has been specified
                if (args.length > 4) { message.reply("Too many arguments").then(r => r.delete({ timeout: 5000 })); return; }
                //Strip id from argument
                let channelID = args[3].replace(/\D/g, '');
                //Get channel object if it exists
                let ch = message.guild.channels.cache.find(c => c.id == channelID);
                //If channel id is empty, has letters or the object doesn't exist, reject
                if (channelID == '' || (channelID.match(/[a-z]/i) && channelID.length < 1) || ch == undefined) {
                    message.reply("Invalid channel");
                    return;
                }
                //Get all channels
                let channels = global.config.WORK_CHANNELS;
                let found = false;
                let ind = -1;
                //Check if given channel is already in the config file as a log channel and keep index
                for (let i = 0; i < channels.length; i++) {
                    if (channels[i].purpose != "log") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as log channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Remove channel from list
                global.config.WORK_CHANNELS.splice(ind, 1);
                //Notify user and log
                message.reply("Successfuly removed <#" + channelID + "> from the log channels list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Log", "Log Channel list Updated", "Successfuly removed <#" + channelID + "> from the log channels list!", color = "#de4b4b");
            },
            "default": function () {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "config help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}

//#endregion

//#region Func. Toggle dupes & reuse codes

exports.toggleDupes = function (message) {
    if (global.config.ACC_DUPES == true) global.config.ACC_DUPES = false;
    else global.config.ACC_DUPES = true;
    Helpers.saveConfig();
    message.reply("Figure Duplicates are now " + ((global.config.ACC_DUPES) ? "enabled" : "disabled"));
    Helpers.log(message, "Core Config - Figure duplicates", "Figure Duplicates are now " + ((global.config.ACC_DUPES) ? "enabled" : "disabled"), "", color = "#4bde64");
}

exports.toggleReuseCodes = function (message) {
    if (global.config.REUSE_CODES == true) global.config.REUSE_CODES = false;
    else global.config.REUSE_CODES = true;
    Helpers.saveConfig();
    message.reply("Reusable Codes are now " + ((global.config.REUSE_CODES) ? "enabled" : "disabled"));
    Helpers.log(message, "Core Config - Reusable Codes", "Reusable Codes are now " + ((global.config.REUSE_CODES) ? "enabled" : "disabled"), "", color = "#4bde64");
}

//#endregion

//#region Func. Change prefix
exports.changePrefix = function (message, args) {
    if (args.length < 3) { message.reply("Too few arguments"); return; }
    if (args.length > 3) { message.reply("Too many arguments"); return; }

    let pref = args[2];
    global.config.PREFIX = pref;
    message.reply("Successfuly changed the prefix to `" + pref + "`\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
    Helpers.log(message, "Core Config - Prefix", "Prefix Changed", "Successfuly changed the prefix to `" + pref + "`", color = "#4bde64");
}
//#endregion

//#region Func. Process "admin" commands
/**
 * Proccess admin commands
 * 
 * @param {Discord.Message} message
 * @param {Array<string>} args
 */
exports.processAdminCommand = function (message, args) {
    if (args.length < 3) {
        message.reply("Too few arguments");
        return;
    }
    function execute(command) {
        let fn;
        const options = {
            "add": () => {
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[3] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                global.config.ADMIN_ROLES = global.config.ADMIN_ROLES.concat([role.id]).unique();
                message.reply("Successfuly added <@&" + role.id + "> to the admin list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Access Roles - Administrator", "Administrator List Updated", "Successfully added **" + `${role}` + "** to the admin list!", color = "#4bde64");
            },
            "remove": () => {
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { Helpers.throwError(message, args[3] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                let ind = global.config.ADMIN_ROLES.indexOf(role.id);
                if (ind != -1) {
                    global.config.ADMIN_ROLES.splice(ind, 1);
                    message.reply("Successfuly removed <@&" + role.id + "> from the admin list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                    Helpers.log(message, "Access Roles - Administrator", "Administrator List Updated", "Successfully removed **" + `${role}` + "** from the admin list!", color = "#de4b4b");
                } else message.reply("<@&" + role.id + "> is not in the admin list.");
            },
            "default": () => {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "config help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}
//#endregion

//#region Func. Process "mod" commands
/**
 * Proccess mod commands
 * 
 * @param {Discord.Message} message
 * @param {Array<string>} args
 */
exports.processModCommand = function (message, args) {
    if (args.length < 3) {
        message.reply("Too few arguments");
        return;
    }
    function execute(command) {
        let fn;
        const options = {
            "add": () => {
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[3] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                global.config.MOD_ROLES = global.config.MOD_ROLES.concat([role.id]).unique();
                message.reply("Successfuly added <@&" + role.id + "> to the mod list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Access Roles - Moderators", "Moderator List Updated", "Successfully added **" + `${role}` + "** to the mod list!", color = "#4bde64");
            },
            "remove": () => {
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { Helpers.throwError(message, args[3] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                let ind = global.config.MOD_ROLES.indexOf(role.id);
                if (ind != -1) {
                    global.config.MOD_ROLES.splice(ind, 1);
                    message.reply("Successfuly removed <@&" + role.id + "> from the mod list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                    Helpers.log(message, "Access Roles - Moderators", "Moderator List Updated", "Successfully removed **" + `${role}` + "** from the mod list!", color = "#de4b4b");
                } else message.reply("<@&" + role.id + "> is not in the mod list.");
            },
            "default": () => {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "config help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}
//#endregion

//#region Func. Reload config
exports.reloadConfig = async function (message) {
    let rep = await message.channel.send("Reloading...");
    Helpers.reloadConfig()
        .then(() => rep.edit("Reload Complete!").then(() => rep.delete({ timeout: 2000 }).then(() => message.delete())))
        .catch((err) => console.error(err));
}
//#endregion

//#region Func. Save config
exports.saveConfig = async function (message) {
    let rep = await message.channel.send("Saving...");
    Helpers.saveConfig()
        .then(() => rep.edit("Save Complete!").then(() => rep.delete({ timeout: 2000 }).then(() => message.delete())))
        .catch((err) => console.error(err));
}
//#endregion