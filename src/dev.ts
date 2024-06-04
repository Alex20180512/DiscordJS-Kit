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
});

bot.start().then(() => {
  bot.client.on("messageReactionAdd", async (reaction, user) => {
    console.log(reaction);
    console.log("======");
    console.log(user);
  });

  bot.client.on("messageReactionRemove", async (reaction, user) => {
    console.log(reaction);
    console.log("======");
    console.log(user);
  });
});
