const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const logger = require('./logger')

if(!process.env.DISCORD_TOKEN)
    //Attempt to load env from a env file if none was auto registered
    require('dotenv').config()

let db, countCollection, userCollection;

const embedColor = "#fcba03"

if(!process.env.DISCORD_TOKEN)
    logger.fatalError('[ERROR] Missing ENV: DISCORD_TOKEN')
if(!process.env.DISCORD_CLIENTID)
    logger.fatalError('[ERROR] Missing ENV: DISCORD_CLIENTID')
if(!process.env.MONGO_URL)
    logger.warn('[WARNING] Missing ENV: MONGO_URL, bot will continue in testing mode')

const initMongo = async() => {
    if(!process.env.MONGO_URL) return
    const mongo = new MongoClient(process.env.MONGO_URL);
    await mongo.connect();
    db = mongo.db('do-j');
    countCollection = db.collection('counter');
    userCollection = db.collection('users');

    logger.status("Database connected")
}

const leaderEmojiIndex = ["🏆", "🥈", "🥉"]
async function getLeaderboardText(doc, index){
    const user = await client.users.fetch(doc);
    return `${leaderEmojiIndex[index]||""} - ${user.username}`;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.on('clientReady', () => {
    logger.status("Bot running");
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand())// ||interaction.commandName != 'do_j')
        return

    if(!db || !countCollection || !userCollection){
        interaction.reply('do j bot is not avalible right now (bot is being tested)');
        return
    }

    try{
        switch(interaction.commandName){
            case 'do_j':
                await userCollection.updateOne(
                    { id: interaction.user.id },
                    { $inc: { count: 1 } },
                    { upsert: true }
                )
                await countCollection.findOneAndUpdate(
                    {},
                    { $inc: { counter: 1} },
                    { upsert: true }
                );
                const doc = await countCollection.findOne({});
                if(interaction.user.id === '477903313594089473'){
                    interaction.reply(`did j ${doc.counter} times (blu edition)`)
                }else{
                    interaction.reply(`did j ${doc.counter} times`)
                }
                break;
            case 'leaderboard':
                const topUsers = await userCollection
                    .find()
                    .sort({ count: -1 })
                    .limit(5)
                    .toArray();
                const descriptions = await Promise.all(
                    topUsers.map((u, i) => getLeaderboardText(u.count, i+1)).join("\n")
                );
                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle('Top 5 j do-ers')
                    .setDescription(descriptions)
                    .setTimestamp(Date.now());
                interaction.reply({embeds: [embed]});
                break;
            default:
                interaction.reply('no.')
        }
    }catch(e){
        logger.error(e);
        if(interaction.user.id === process.env.OWNER_ID||'1164322893438648401'){
            interaction.reply({content:'Error: ```'+e+'```', ephemeral: true})
        }else{
            interaction.reply('There was an error :sad: try again later.')
        }

    }

})

initMongo().then(() => client.login(process.env.DISCORD_TOKEN))
