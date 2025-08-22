const { REST, Routes, SlashCommandBuilder } = require('discord.js');

if(!process.env.DISCORD_TOKEN)
    require('dotenv').config()

//Only one command for now..
//Thats all this bot is meant for anyway.
const command = (
    new SlashCommandBuilder()
        .setName('do_j')
        .setDescription('do j')
        .setContexts([0, 1, 2])
).toJSON();

const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN)

rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENTID),
    { body: [command] }
)
.then(() => console.log('[STATUS] Commands registered'))
.catch((e) => console.log('[ERROR] Failed to register commands '+e))