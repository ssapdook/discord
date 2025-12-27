require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ===== 슬래시 명령어 정의 (금액 옵션 선택, 필수 아님) =====
const commands = [
    new SlashCommandBuilder()
        .setName('usd')
        .setDescription('USD를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 1 USD)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('jpy')
        .setDescription('JPY를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 100 JPY)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('cny')
        .setDescription('CNY를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 1 CNY)')
                .setRequired(false)
        ),
    // 한국어 명령어
    new SlashCommandBuilder()
        .setName('달러')
        .setDescription('USD를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 1 USD)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('엔')
        .setDescription('JPY를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 100 JPY)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('위안')
        .setDescription('CNY를 한국 원화로 환산합니다.')
        .addNumberOption(option =>
            option.setName('금액')
                .setDescription('환산할 금액 (기본 1 CNY)')
                .setRequired(false)
        )
].map(cmd => cmd.toJSON());

// ===== 슬래시 명령어 등록 =====
(async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('슬래시 명령어 등록 중...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('슬래시 명령어 등록 완료!');
    } catch (error) {
        console.error('슬래시 명령어 등록 오류:', error);
    }
})();

// ===== 봇 준비 이벤트 =====
client.once('clientReady', () => {
    console.log(`${client.user.tag} 봇이 준비되었습니다!`);
});

// ===== 슬래시 명령어 처리 =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();

    const apiKey = process.env.EXCHANGE_API_KEY;
    try {
        let currency, defaultAmount, symbol, color;

        switch (interaction.commandName) {
            case 'usd':
            case '달러':
                currency = 'USD';
                defaultAmount = 1;
                symbol = '💵';
                color = 0x1abc9c;
                break;
            case 'jpy':
            case '엔':
                currency = 'JPY';
                defaultAmount = 100;
                symbol = '💴';
                color = 0xe67e22;
                break;
            case 'cny':
            case '위안':
                currency = 'CNY';
                defaultAmount = 1;
                symbol = '🇨🇳';
                color = 0xe74c3c;
                break;
            default:
                return;
        }

        // 옵션으로 금액 받기, 없으면 기본값
        const amount = interaction.options.getNumber('금액') || defaultAmount;

        const res = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`);
        const krw = res.data.conversion_rates.KRW;
        const krwAmount = (krw * amount).toLocaleString();

        const now = new Date();
        const koreaTime = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        const embed = new EmbedBuilder()
            .setTitle(`${symbol} ${currency} → KRW 환율`)
            .setDescription(`**${amount} ${currency} = ${krwAmount} KRW**`)
            .setColor(color)
            .setFooter({ text: `현재 시간: ${koreaTime}` });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('환율 명령어 실행 오류:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply('환율 정보를 가져오는데 실패했습니다.');
        } else {
            await interaction.reply('환율 정보를 가져오는데 실패했습니다.');
        }
    }
});

// ===== 봇 로그인 =====
client.login(process.env.DISCORD_TOKEN);
