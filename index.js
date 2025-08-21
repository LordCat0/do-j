const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');


if(!process.env.DISCORD_TOKEN)
    //Attempt to load env from a env file if none was auto registered
    require('dotenv').config()

let db, collection;

if(!process.env.DISCORD_TOKEN)
    throw new Error('[ERROR] Missing ENV: DISCORD_TOKEN')
if(!process.env.DISCORD_CLIENTID)
    throw new Error('[ERROR] Missing ENV: DISCORD_CLIENTID')
if(!process.env.MONGO_URL)
    console.warn('[WARNING] Missing ENV: MONGO_URL, bot will continue in testing mode')

const initMongo = async() => {
    const mongo = new MongoClient(process.env.MONGO_URL);
    await mongo.connect();
    db = mongo.db('do-j');
    collection = db.collection('counter');
    console.log("[STATUS] Database connected")
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.on('clientReady', () => {
    console.log("[STATUS] Bot running");
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand() ||interaction.commandName != 'do_j')
        return

    if(!db || !collection){
        interaction.reply('do j is not avalible right now (bot is being tested)');
        return
    }

    try{
        const result = await collection.findOneAndUpdate(
        {},
        { $inc: { counter: 1} },
        { returnDocument: "after", upsert: true }
        );

        if(interaction.user.id === '477903313594089473'){
            interaction.reply(`did j ${result.value.counter} times`)
        }else{
            interaction.reply(`did j ${result.value.counter} times (blu edition)`)
        }
    }catch(e){
        console.error(`[ERROR] ${e}`);
        if(interaction.user.id === process.env.OWNER_ID||'1164322893438648401'){
            interaction.reply({content:'Error: ```'+e.message+'```', ephemeral: true})
        }else{
            interaction.reply('There was an error doing j :sad: try again later.')
        }

    }

})

client.login(process.env.DISCORD_TOKEN)