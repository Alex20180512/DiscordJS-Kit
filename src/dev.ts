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
  messageStacks: [
    {
      channelID: process.env.CHANNEL_ID!,
      content: () => "Hello, World! " + new Date().toLocaleTimeString(),
      cron: "*/10 * * * * *",
    },
    {
      channelID: process.env.CHANNEL_ID!,
      content: () => "Hello, World! (from a function) " + new Date().toLocaleTimeString(),
      cron: "*/15 * * * * *",
    },
    {
      channelID: process.env.CHANNEL_ID!,
      content: async () => {
        return new Promise<string>((resolve) => {
          resolve("Hello, World! (from a promise) " + new Date().toLocaleTimeString());
        });
      },
      cron: "*/20 * * * * *",
    },
  ],
});

bot.start();