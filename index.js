//#region load .env

const envFile = require('dotenv').config();
if (envFile.error) {
    throw envFile.error
}
const env = envFile.parsed;

//Validate config
if (env.BOT_TOKEN == undefined) throw "Missing BOT_TOKEN in .env file";
if (env.DB_URL == undefined) throw "Missing PREFIX in .env file";

//#endregion

//#region load config

const fs = require("fs");
const configFilePath = './config.json';

try {
    if (!fs.existsSync(configFilePath)) {
        let emptyConf = {
            ACC_DUPES: false,
            REUSE_CODES: false,
            PREFIX: "-",
            WORK_CHANNELS: [],
            ADMIN_ROLES: [],
            MOD_ROLES: []
        };
        fs.writeFileSync(configFilePath, JSON.stringify(emptyConf, null, 2));
    }
    global.config = JSON.parse(fs.readFileSync(configFilePath));
} catch (err) { console.error(err); }

//#endregion

const mongoose = require("mongoose");
const Discord = require("discord.js");
const client = new Discord.Client();
const token = env.BOT_TOKEN;
const Helpers = require("./helpers");
const ConfigNode = require("./config_node/config");
const RequestsNode = require("./requests_node/requests");
const CollectionsNode = require("./collections_node/collections");
const WikiNode = require("./wiki_node/wiki");

client.on("ready", () => {
    mongoose.connect(env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('useFindAndModify', false);
    console.info("Bot Ready");
});

client.on("message", (message) => {
    if (message.author.bot || message.guild === null) return;
    if (!Helpers.isCommand(message, global.config.PREFIX)) {
        if (!Helpers.canSpeakInChannel(message, notify = true)) message.delete();
        return;
    }
    //Get args
    let args = message.content.substr(global.config.PREFIX.length).split(" ");
    //Check if command is help
    if (args[0] == "help" && args.length == 1) {
        Helpers.showHelpMenu(message);
        return;
    }
    ConfigNode.run(message);
    RequestsNode.run(message);
    CollectionsNode.run(message);
    WikiNode.run(message);
});

client.login(token);

//#region Custom functions for default types

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};
String.prototype.capitalize = function () {
    let words = this.split(" ");
    let cap = "";
    for (let i = 0; i < words.length; i++) {
        let nw = words[i].toLowerCase();
        nw = nw.charAt(0).toUpperCase() + nw.slice(1);
        cap += nw + " ";
    }
    return cap;
}

//#endregion