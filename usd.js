const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usd')
        .setDescription('1 달러를 한국 원화로 환산합니다.'),

    async execute(interaction) {
        await interaction.deferReply();
        const apiKey = process.env.EXCHANGE_API_KEY;

        try {
            const res = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
            const krw = res.data.conversion_rates.KRW;
            await interaction.editReply(`💵 1 USD = ${krw.toLocaleString()} KRW`);
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply('환율 정보를 가져오는데 실패했습니다.');
            } else {
                await interaction.reply('환율 정보를 가져오는데 실패했습니다.');
            }
        }
    }
};
