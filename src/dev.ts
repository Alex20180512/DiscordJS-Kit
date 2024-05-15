import "dotenv/config";
import { Bot } from ".";

const bot = new Bot({
  meta: {
    appName: "discordjs-kit",
    token: process.env.TOKEN!,
    clientID: process.env.CLIENT_ID!,
    guildsID: [process.env.GUILD_ID!],
  },
  slashCommands: [
    {
      name: "ping",
      description: "Replies with Pong!",
      async execute(interaction) {
        await interaction.reply("Pong!");
      },
    },
  ],
});

bot.start();
