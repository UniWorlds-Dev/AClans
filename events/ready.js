//===============READY EVENT================
module.exports = {
    name: 'ready',
    async execute(client){
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const config = client.config;
        const clansChanel = client.channels.cache.get(config.mainClanChannel);

        if (!clansChanel) {
            console.log(`Ошибка: неверный идентификатор канала!`);
            return;
        }
        setTimeout(async () => {
            const clansMessage = await createClanMessage(clansChanel);
            if (!clansMessage) {
                console.log("Ошибка: невозможно отправить сообщение со статусом!");
                return;
            }
        }, 1000);

        const clearOldMessages = async (channel, nbr) => {
            try {
                const messages = await channel.messages.fetch({ limit: 99 });
                let i = 0;
                for (const message of messages.values()) {
                    if (i >= nbr) {
                        await message.delete().catch(() => {});
                    }
                    i += 1;
                }
            } catch (error) {
                console.error(`Произошла ошибка при очистке старых сообщений!\n${ error.message }`);
            }
        }
        
        const getLastMessage = async (channel) => {
            try {
                const messages = await channel.messages.fetch({ limit: 20 });
                const filteredMessages = messages.filter((message) => {
                    return true;
                });
                return filteredMessages.first();
            } catch (e) {
                console.error(`Произошла ошибка при получении последнего сообщения (его нету)!\n${ error.message }`);
                return null;
            }
        }

        const createClanMessage = async (channel) => {
            await clearOldMessages(channel, 1);
        
            const clanButtonMessage = await getLastMessage(channel);
            if (clanButtonMessage) {
                return clanButtonMessage;
            }
        
            await clearOldMessages(channel, 0);
        
            const embed = new EmbedBuilder()
            .setColor(config.embedCollor)
            .setAuthor({
                name: 'Bandomas Кланы'
            })
            .setDescription(`**Для создания клана нажми на кнопку ниже!**`)
            .setThumbnail(config.thumbImage)
            .setFooter({
                text: config.footerText
            })
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('requestEmbed')
                .setLabel('Создать Клан')
                .setEmoji('💚')
                .setStyle(ButtonStyle.Primary)
            )
            return channel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
}