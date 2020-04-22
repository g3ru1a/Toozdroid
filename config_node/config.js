const Discord = require("discord.js");
const Helpers = require("../helpers");

exports.run = async function (message) {
    //Get args
    let args = message.content.substr(global.config.PREFIX.length).split(" ");
    //Check if command calls this node
    if (args[0] != "conf" && args[0] != "config") return;
    //Check if user has the perms to use the commands
    if (!Helpers.isAdmin(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    //Use object literals
    function execute (command, parent){
        let fn;
        const options = {
            "reload": () => parent.reloadConfig(message),
            "save": () => parent.saveConfig(message),
            "mod": () => parent.processModCommand(message, args),
            "admin": () => parent.processAdminCommand(message, args),
            "chat": () => { return; },
            "prefix": () => { return; },
            "dupes": () => { return; },
            "reuse-codes": () => { return; },
            "overview": () => { return; },
            "help": () => { return; }
        }

        if (options[command]) fn = options[command];
        else fn = options['help'];

        return fn();
    }

    execute(args[1], this);
}

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
                message.reply("Successfuly added <@&" + role.id + "> to the mod list!\nDo `"+global.config.PREFIX+"conf save` to save the changes.");
                Helpers.log(message, "Access Roles - Moderators", "Moderator List Updated",  "Successfully added **" + `${role}` + "** to the mod list!", color="#4bde64");
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
        .then( () => rep.edit("Reload Complete!").then( () => rep.delete({ timeout: 2000 }).then( () => message.delete() ) ) )
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