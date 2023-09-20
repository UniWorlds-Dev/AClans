const DB = require('./DB');
const Logger = require('./Log');

/**
 * Получение конфигурации из указанной директории или создание конфигурации по умолчанию, если ее нет.
 *
 * @param {string} directory - Путь к директории, где находится файл конфигурации.
 * @returns {Object} - Объект конфигурации.
*/
function getConfig(directory) {
    const config_file = new DB(directory);
    
    // Проверка наличия компонента 'config' в файле конфигурации, и, если его нет, создание со значениями по умолчанию.
    if (!config_file.get('config')) {
        Logger.warn(`Конфигурационный файл не найден, создаю!`);
        config_file.init('config', {
            lang: 'ru.json',
    
            discordToken: '',
            discordPrefix: '*',
            mainClanChannel: '',
            embedCollor: '#ff6a00',
            thumbnailImage: 'https://images-ext-2.discordapp.net/external/Y0Sb3cCmyPxlxwxE8e8guHnYgvVCp9pHTTc2K41Ly9Y/https/i.imgur.com/ngZFpUl.png',
            footerText: 'Bandomas.pro | 19132',
    
            enableLeaderboard: true,
            enableWebLeaderboard: false,
    
            enableUnMiNeDIntegration: true,
    
            disableClanPVPByDefault: false,
    
            enableHeadChat: true,
            enableLocalChat: false,
            enableClanChatByDefault: true,
    
            enableRating: true,
    
            enableIssuingAssigment: true,
    
            clansMinecraftColors: [
                "§0", // black
                "§4", // dark_red
                "§c", // red
                "§6", // gold
                "§e", // yellow
                "§2", // dark_green
                "§a", // green
                "§b", // aqua
                "§3", // dark_aqua
                "§9", // blue
                "§1", // dark_blue
                "§5", // dark_purple
                "§d", // light_purple
                "§8", // dark_gray
                "§7", // gray
                "§f"  // white
            ],
            clansDiscordEmojiColors: [
                "<:black:1073958622180167721>",
                "<:dark_red:1073958635635494983>",
                "<:red:1073958614416498698>",
                "<:gold:1073958708045946930>",
                "<:yellow:1073958619332214845>",
                "<:dark_green:1073958685820342362>",
                "<:green:1073958610016669706>",
                "<:aqua:1073958620737314898>",
                "<:dark_aqua:1073958626173145088>",
                "<:blue:1073958624604471407>",
                "<:dark_blue:1073958628589064212>",
                "<:dark_purple:1073958634024869919>",
                "<:light_purple:1073958611555987506>",
                "<:dark_gray:1073958630270967878>",
                "<:gray:1073958607462342686>",
                "<:white:1073958616463323249>"
            ],
            clansDiscordRoleColors: [
                "#000000",  // black
                "#AA0000",  // dark_red
                "#FF5555",  // red
                "#FFAA00",  // gold
                "#FFFF55",  // yellow
                "#00AA00",  // dark_green
                "#55FF55",  // green
                "#55FFFF",  // aqua
                "#00AAAA",  // dark_aqua
                "#5555FF",  // blue
                "#0000AA",  // dark_blue
                "#AA00AA",  // dark_purple
                "#FF55FF",  // light_purple
                "#555555",  // dark_gray
                "#AAAAAA",  // gray
                "#FFFFFF"   // white
            ],
            clansUnicodeIconsList: [
                "\uE100", 
                "\uE101", 
                "\uE102", 
                "\uE103", 
                "\uE104", 
                "\uE105", 
                "\uE106", 
                "\uE107", 
                "\uE108", 
                "\uE109", 
                "\uE10A", 
                "\uE10B", 
                "\uE10C", 
                "\uE10D", 
                "\uE10E", 
                "\uE10F",
            ],
    
            enableUniCoinRewards: true,
            uniCoinReward: [ 1, 5 ],
    
            debugMode: true
        });
        Logger.warn(`Конфигурационный файл создан и находится в \x1b[1m\x1b[32m"${directory}"\x1b[0m!`);
    }
    
    // Возврат компонента 'config' из файла конфигурации.
    const config = config_file.get('config');
    if(config.debugMode){
        const debug = require('../debugConf.json');
        config.discordToken = debug.debugToken;
        config.mainClanChannel = debug.mainClanChannel;
    }
    return config;
}

module.exports = { getConfig };