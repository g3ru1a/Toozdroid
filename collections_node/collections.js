const Discord = require("discord.js");
const Helpers = require("../helpers");
const Tools = require("./tools");

exports.run = async function (message) {
    //Get args
    let args = message.content.substr(global.config.PREFIX.length).split(" ");
    //Check if command calls this node
    if (args[0] != "col" && args[0] != "collection") return;
    //Use object literals
    function execute(command, parent) {
        let fn;
        const options = {
            "add": () => parent.add(message, args),
            "show": () => parent.show(message, args),
            "push": () => parent.push(message, args),
            "remove": () => parent.remove(message, args),
            "figs": () => {
                if (args[2] == "link") parent.link(message, args);
                else if (args[2] == "unlink") parent.unlink(message, args);
            },
            "figures": () => {
                if (args[2] == "link") parent.link(message, args);
                else if (args[2] == "unlink") parent.unlink(message, args);
            },
            "rules": () => parent.rule(message, args),
            "check-all": () => parent.rule(message),
            "help": () => parent.showHelpMenu(message)
        }

        if (options[command]) fn = options[command];
        else fn = options['help'];

        return fn();
    }

    execute(args[1], Tools);
}