const axios = require('axios');
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, WebhookClient } = require('discord.js');

// Leer configuración desde config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = (client) => {
    const roleId = config.roleId;
    const voiceChannels = config.voiceChannels;
    const webhookUrl = config.webhookUrl;

    // Crear un cliente webhook
    const webhookClient = new WebhookClient({ url: webhookUrl });

    client.on('voiceStateUpdate', async (oldState, newState) => {
        const newStateChannelId = newState.channelId;
        const oldStateChannelId = oldState.channelId;

        const member = newState.member;
        const role = member.guild.roles.cache.get(roleId);

        if (!role) {
            console.log(`No se pudo encontrar el rol con ID ${roleId}.`);
            return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleString('es-ES', { timeZone: 'UTC', hour12: false });

        // Verifica si el canal es uno de los canales de voz registrados
        if (voiceChannels[newStateChannelId] || voiceChannels[oldStateChannelId]) {
            if (voiceChannels[newStateChannelId]) {
                await member.roles.add(role);
                console.log(`Se asignó el rol a ${member.user.tag} en el canal de voz ${voiceChannels[newStateChannelId]}.`);

                const embed = new EmbedBuilder()
                    .setTitle('Usuario se unió a un canal de voz')
                    .addFields(
                        { name: 'Usuario', value: member.user.tag, inline: true },
                        { name: 'Canal de voz', value: voiceChannels[newStateChannelId], inline: true },
                        { name: 'Fecha y hora de entrada', value: formattedDate, inline: false }
                    )
                    .setColor(0x00FF00) // Verde
                    .setTimestamp();

                webhookClient.send({
                    username: 'Voice Channel Logger',
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [embed],
                });
            } else if (voiceChannels[oldStateChannelId]) {
                await member.roles.remove(role);
                console.log(`Se quitó el rol de ${member.user.tag} en el canal de voz ${voiceChannels[oldStateChannelId]}.`);

                const embed = new EmbedBuilder()
                    .setTitle('Usuario se salió de un canal de voz')
                    .addFields(
                        { name: 'Usuario', value: member.user.tag, inline: true },
                        { name: 'Canal de voz', value: voiceChannels[oldStateChannelId], inline: true },
                        { name: 'Fecha y hora de salida', value: formattedDate, inline: false }
                    )
                    .setColor(0xFF0000) // Rojo
                    .setTimestamp();

                webhookClient.send({
                    username: 'Voice Channel Logger',
                    avatarURL: client.user.displayAvatarURL(),
                    embeds: [embed],
                });
            }
        }
    });
};
