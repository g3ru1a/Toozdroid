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
            "add": () => parent.addFromCode(message, args),
            "show": () => parent.show(message, args),
            "push": () => parent.push(message, args),
            "remove": () => parent.remove(message, args),
            "figs": () => {
                if (args[2] == "link") parent.link(message, args);
                else if (args[2] == "unlink") parent.unlink(message, args);
                else parent.showHelpMenu(message)
            },
            "figures": () => {
                if (args[2] == "link") parent.link(message, args);
                else if (args[2] == "unlink") parent.unlink(message, args);
                else parent.showHelpMenu(message)
            },
            "rules": () => {
                if (args[2] == "add") parent.addRule(message, args);
                else if (args[2] == "del" || args[2] == "rem" ||
                    args[2] == "delete" || args[2] == "remove") parent.removeRule(message, args)
                else parent.showHelpMenu(message)
            },
            "help": () => parent.showHelpMenu(message)
        }

        if (options[command]) fn = options[command];
        else fn = options['help'];

        return fn();
    }

    execute(args[1], Tools);
}