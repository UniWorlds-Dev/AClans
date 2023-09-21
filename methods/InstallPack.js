const fs = require('fs-extra');
const path = require('path');

const installAClansResourcePack = async () => {
    try {
        const serverPropertiesPath = './server.properties';
        const serverPropertiesContent = await fs.readFile(serverPropertiesPath, 'utf-8');

        const levelNameMatch = serverPropertiesContent.match(/level-name=(.+)/);
        if (!levelNameMatch) {
            console.error('Переменная level-name не найдена в файле server.properties.');
            return;
        }

        const worldFolder = levelNameMatch[1].trim();

        const sourceResourcePackPath = path.join(__dirname, 'packs', 'AClans');;

        const worldResourcePackPath = `./worlds/${worldFolder}/resource_packs/`;

        await fs.ensureDir(worldResourcePackPath);

        const worldResourcePacksPath = `./worlds/${worldFolder}/world_resource_packs.json`;
        const resourcePacksData = { packs: [] };
        if (await fs.pathExists(worldResourcePacksPath)) {
            const existingResourcePacks = await fs.readJson(worldResourcePacksPath);
            resourcePacksData.packs = existingResourcePacks.packs || [];
        }

        const packIdToInstall = "a9d5c653-6801-4a72-b976-bb7cbb6f7e04";
        const isPackInstalled = resourcePacksData.packs.some(pack => pack.pack_id === packIdToInstall);

        if (!isPackInstalled) {
            await fs.copy(sourceResourcePackPath, path.join(worldResourcePackPath, 'AClans'));

            resourcePacksData.packs.push({
                pack_id: packIdToInstall,
                version: [1, 0, 0]
            });

            await fs.writeJson(worldResourcePacksPath, resourcePacksData, { spaces: 4 });

            console.log('Ресурс-пак AClans успешно установлен для мира', worldFolder);
        } else {
            console.log('Ресурс-пак AClans уже установлен для мира', worldFolder);
        }
    } catch (err) {
        console.error('Произошла ошибка:', err);
    }
}