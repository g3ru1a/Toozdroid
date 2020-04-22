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
            COLLECTION_CH: [],
            LOG_CH: [],
            FIGURE_REQUESTS_CH: [],
            WIKI_CH: [],
            ADMIN_ROLES: [],
            MOD_ROLES: []
        };
        fs.writeFileSync(configFilePath, JSON.stringify(emptyConf, null, 2));
    }
    global.config = JSON.parse(fs.readFileSync(configFilePath));
} catch (err) { console.error(err); }

//#endregion

const Discord = require("discord.js");
const client = new Discord.Client();
const token = env.BOT_TOKEN;
const Helpers = require("./modules/helpers.js");

client.on("ready", () => {
    console.info("Bot ready");
});

client.on("message", (message) => {
    if (message.author.bot) return;
    if (!Helpers.isCommand(message, global.config.PREFIX)) return;
    Helpers.logCommand(message, "New Message", "User sent message in " + message.channel, message.content);
});

client.login(token);