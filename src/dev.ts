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
  on: [
    {
      label: "45",
      name: "messageReactionAdd",
      action: (reaction, user) => {
        console.log(1);
      },
    },
    {
      label: "2",
      name: "messageReactionAdd",
      action: (reaction, user) => {
        bot.event.listening;
      },
    },
  ] as const,
});

bot.start();
