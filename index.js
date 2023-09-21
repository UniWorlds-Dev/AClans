/**
 * Регистрация плагина AClans.
 *
 * @param {string} name - Имя плагина.
 * @param {string} description - Описание плагина.
 * @param {number[]} version - Версия плагина (массив из трех чисел).
 * @param {Object} options - Опции плагина.
 * @param {string} options.author - Автор плагина.
 */
ll.registerPlugin('AClans', 'Плагин для LLBDS, добавляющий кланы.', [1, 0, 0], {
    author: "Alpha",
});

const fs = require('fs');
const path = require('path');
const DB = require('./methods/DB');
const Logger = require('./methods/Log');
const { getConfig } = require('./methods/ConfigFile');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Загрузка конфигурации из файла.
const config = getConfig('./plugins/AClans/config.json');

// Создание клиента Discord.js с указанием интентов.
const client = new Client({ intents: [Object.keys(GatewayIntentBits)] });

// Установка конфигурации для клиента.
client.config = config;

// Вход в Discord с использованием токена из конфигурации.
client.login(config.discordToken);

// Загрузка и подключение событий Discord.
const eventsFolderPath = path.join(__dirname, 'events');
const events = fs.readdirSync(eventsFolderPath).filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
}

// Загрузка и подключение Minecraft событий.
const MCeventsFolderPath = path.join(__dirname, 'mc_events');
const MCevents = fs.readdirSync(MCeventsFolderPath).filter(file => file.endsWith('.js'));
for (const file of MCevents) {
    const event = require(`./mc_events/${file}`);
    mc.listen(event.name, (...args) => event.execute(...args, client));
}

// Обработка команд в чате Discord.
const cmds = require("./cmds.js");
client.on('messageCreate', (msg) => {
    if (msg.author.username != client.user.username && msg.author.discriminator != client.user.discriminator) {
        const discordCmd = msg.content.trim() + " ";
        const discordCmdName = discordCmd.slice(0, discordCmd.indexOf(" "));
        for (i in cmds) {
            const cmdsListName = config.discordPrefix + cmds[i].name;
            if (discordCmdName == cmdsListName) {
                cmds[i].out(client, msg);
            }
        }
    }
});

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("clans", "", PermType.Any);
    cmd.overload([]);
    cmd.setCallback((cmd, ori, out, res) => {
    });
    cmd.setup();
});
