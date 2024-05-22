import "dotenv/config";
import { Bot } from ".";

const bot = new Bot({
  meta: {
    logToFile: false,
    appName: "discordjs-kit",
    token: process.env.TOKEN!,
    clientID: process.env.CLIENT_ID!,
    guildsID: [process.env.GUILD_ID!],
  },
  slashCommands: [
    {
      name: "ping",
      description: "Replies with Pong!",
      admin: true,
      async execute(interaction) {
        await interaction.reply("Pong!");
      },
    },
    {
      name: "ping1",
      description: "Replies with Pong!Replies with Pong!Replies with Pong!",
      admin: true,
      async execute(interaction) {
        await interaction.reply("Pong!");
      },
    },
  ],
  messageStacks: [
    {
      channelsID: [process.env.CHANNEL_ID!, "1240548017715544064"],
      content: () => "Hello, World! " + new Date().toLocaleTimeString(),
      cron: "*/10 * * * * *",
    },
    {
      channelsID: [process.env.CHANNEL_ID!],
      content: () => "Hello, World! (from a function) " + new Date().toLocaleTimeString(),
      cron: "*/65 * * * * *",
    },
    {
      channelsID: [process.env.CHANNEL_ID!],
      content: async () => {
        return new Promise<string>((resolve) => {
          resolve("Hello, World! (from a promise) " + new Date().toLocaleTimeString());
        });
      },
      cron: "*/75 * * * * *",
    },
  ],
});

bot.start();
