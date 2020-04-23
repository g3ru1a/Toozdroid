const Discord = require("discord.js");
const Helpers = require("../helpers");
const Tools = require("./tools");

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
            "prefix": () => parent.changePrefix(message, args),
            "dupes": () => parent.toggleDupes(message),
            "reuse-codes": () => parent.toggleReuseCodes(message),
            "log-chat": () => parent.manageLogChats(message, args),
            "log-chat-speak": () => parent.manageLogChatSpeakers(message, args),
            "overview": () => parent.showOverview(message),
            "help": () => parent.showHelpMenu(message)
        }

        if (options[command]) fn = options[command];
        else fn = options['help'];

        return fn();
    }

    execute(args[1], Tools);
}
