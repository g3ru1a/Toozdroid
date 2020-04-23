const Discord = require("discord.js");
const Helpers = require("../helpers");
const Tools = require("./tools");

exports.run = async function (message) {
    //Get args
    let args = message.content.substr(global.config.PREFIX.length).split(" ");
    //Check if command calls this node
    if (args[0] != "req" && args[0] != "request") return;
    //Check if user has the perms to use the commands
    if (!Helpers.isAdmin(message)) {
        message.author.send("You cannot use that command.");
        return;
    }
    //Use object literals
    function execute(command, parent) {
        let fn;
        const options = {
            "vote": () => parent.vote(message, args),
            "unvote": () => parent.unvote(message, args),
            "rank": () => parent.showRank(message, args),
            "top": () => parent.top(message, args),
            "list": () => parent.list(message, args),
            "remove": () => parent.remove(message),
            "help": () => parent.showHelpMenu(message)
        }

        if (options[command]) fn = options[command];
        else fn = options['help'];

        return fn();
    }

    execute(args[1], Tools);
}
