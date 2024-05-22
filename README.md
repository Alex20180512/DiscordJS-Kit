# DiscordJS-Kit

A declarative Bot script development tool.

## Latest version

[![npm](https://img.shields.io/npm/v/discord.js.svg)](https://www.npmjs.com/package/discord.js)

## Supported versions

[discord.js v14.15.2](https://www.npmjs.com/package/discord.js/v/14.15.2)

## Requirements

This tool requires Node.js version 16.20.2 or higher.

## Feature

- Logger
- Slash Command
- Message Stack

## Install

```shell
npm install discordjs-kit
```

## Usage

```ts
import "dotenv/config";
import { Bot } from "discordjs-kit";

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
      channelsID: [process.env.CHANNEL_ID!],
      // Return an empty string if you don't want to send anything
      content: "",
      cron: ["*/10 * * * * *", "*/20 * * * * *"],
    },
    {
      channelsID: [process.env.CHANNEL_ID!],
      content: "Hello, World! " + new Date().toLocaleTimeString(),
      cron: "*/10 * * * * *",
    },
    {
      channelsID: [process.env.CHANNEL_ID!],
      content: () => "Hello, World! (from a function) " + new Date().toLocaleTimeString(),
      cron: "*/15 * * * * *",
    },
    {
      channelsID: [process.env.CHANNEL_ID!],
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
```
