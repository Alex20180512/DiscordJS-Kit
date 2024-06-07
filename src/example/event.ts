import "dotenv/config";
import { Bot } from "..";

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
      name: "start-watch",
      description: "Start watching the channel",
      async execute(interaction) {
        await interaction.reply("Pong!");
      },
    },
    {
      name: "stop-watch",
      description: "Stop watching the channel",
      async execute(interaction) {
        await interaction.reply("Pong!");
      },
    },
  ],
  on: [
    {
      label: "1",
      name: "messageReactionAdd",
      roles: ["1237947006802985051"],
      action: (reaction, user) => {
        console.log(reaction.emoji.name);
      },
    },
    {
      label: "2",
      name: "messageReactionRemove",
      action: (reaction, user) => {
        console.log(reaction.emoji.name);
      },
    },
  ] as const,
});

bot.start().then(() => {
  bot.event.listening("1");
  bot.event.listening("2");
});
