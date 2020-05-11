const Discord = require("discord.js");
const Helpers = require("../helpers");
const Tools = require("./tools");

exports.run = async function (message) {
    //Get args
    let args = message.content.substr(global.config.PREFIX.length).split(" ");
    //Check if command calls this node
    if (args[0] != "wiki") return;
    if (!Helpers.correctChannelUsed(message, "wiki")) return;
    //Use object literals
    function execute(command, parent, self) {
        let fn;
        const options = {
            "add": () => parent.add(message, args),
            "description": () => parent.setDescription(message, args),
            "author": () => parent.setAuthor(message, args),
            "status": () => parent.setStatus(message, args),
            "list": () => parent.list(message, args),
            "remove": () => parent.remove(message, args),
            "chat": () => self.manageRequestChats(message, args),
            "chat-speakers": () => self.manageRequestChatSpeakers(message, args),
            "help": () => parent.showHelpMenu(message),
            "default": () => parent.show(message, args)
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }

    execute(args[1], Tools, this);
}

//#region Func Manage Request Chats Speakers

exports.manageRequestChatSpeakers = function (message, args) {
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
                    if (channels[i].purpose != "wiki") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as wiki channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Get mentioned role
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[4] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                //Add to array
                global.config.WORK_CHANNELS[ind].canSpeak.push(role.id);
                //Notify user and log
                message.reply("Successfuly added " + `${role}` + " to the <#" + channelID + "> speak perms!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Wiki", "Wiki Channels speak perms Updated", "Successfuly added " + `${role}` + " to the <#" + channelID + "> speak perms!", color = "#4bde64");
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
                    if (channels[i].purpose != "wiki") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as wiki channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Get mentioned role
                let mentioned_roles = message.mentions.roles.array();
                if (mentioned_roles.length == 0) { message.reply(args[4] + " is not a role. You must @ the role"); return; }
                let role = mentioned_roles[0];
                //Remove channel from list
                let channel = channels[ind];
                global.config.WORK_CHANNELS[ind].canSpeak.splice(channel.canSpeak.indexOf(role.id), 1);
                //Notify user and log
                message.reply("Successfuly removed " + `${role}` + " from <#" + channelID + "> speak perms!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Wiki", "Wiki Channels speak perms Updated", "Successfuly removed " + `${role}` + " from <#" + channelID + "> speak perms!", color = "#de4b4b");
            },
            "default": function () {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "wiki help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}

//#endregion

//#region Func. Manage Request Chats
/**
 * 
 * @param {Discord.Message} message
 * @param {any} args
 */
exports.manageRequestChats = function (message, args) {
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
                    if (channel.purpose != "wiki") continue;
                    if (channel.id == channelID) {
                        found = true;
                        break;
                    }
                }
                //If channel is already in the config, reject
                if (found) { message.reply("Channel already in config as wiki channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Create object
                let ch_obj = {
                    id: ch.id,
                    name: ch.name,
                    canSpeak: [],
                    purpose: "wiki"
                }
                //Add to array
                global.config.WORK_CHANNELS.push(ch_obj);
                //Notify user and log
                message.reply("Successfuly added <#" + ch_obj.id + "> to the wiki channels list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Wiki", "Wiki Channel list Updated", "Successfuly added <#" + ch_obj.id + "> to the wiki channels list!", color = "#4bde64");
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
                    if (channels[i].purpose != "wiki") continue;
                    if (channels[i].id == channelID) {
                        found = true;
                        ind = i;
                        break;
                    }
                }
                //If channel is not already in the config, reject
                if (!found) { message.reply("Channel not found in config as wiki channel").then(r => r.delete({ timeout: 5000 })); return; }
                //Remove channel from list
                global.config.WORK_CHANNELS.splice(ind, 1);
                //Notify user and log
                message.reply("Successfuly removed <#" + channelID + "> from the wiki channels list!\nDo `" + global.config.PREFIX + "conf save` to save the changes.");
                Helpers.log(message, "Work Channels - Wiki", "Wiki Channel list Updated", "Successfuly removed <#" + channelID + "> from the wiki channels list!", color = "#de4b4b");
            },
            "default": function () {
                message.reply("Command not found. Check available commands with `" + global.config.PREFIX + "wiki help`.");
            }
        }

        if (options[command]) fn = options[command];
        else fn = options['default'];

        return fn();
    }
    execute(args[2]);
}

//#endregion
