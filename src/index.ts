import "web-streams-polyfill/polyfill";
import type DiscordJSType from "discord.js";
import DiscordJSAPI from "discord.js";
import cron from "node-cron";
import { MetaConfig } from "./meta";
import { Table } from "console-table-printer";
import { BotProps, EventLabel } from "./type";

const { Client, Events, GatewayIntentBits, Partials, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } =
  DiscordJSAPI;

export class Bot<P extends BotProps> extends MetaConfig {
  public client: DiscordJSType.Client;
  public rest: DiscordJSType.REST;
  constructor(props: P) {
    super(props);
    this.rest = new REST().setToken(this.token);

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions],
      partials: [Partials.User, Partials.GuildMember, Partials.Reaction, Partials.Message],
    });

    this.client.on(Events.Error, this.loggerError);

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isCommand()) {
        const memberPermissions = interaction.member!.permissions as Readonly<DiscordJSType.PermissionsBitField>;
        const isAdmin = memberPermissions.has(PermissionFlagsBits.Administrator);
        const command = this.getSlashCommandExecuteAction(interaction.commandName);

        if (!command) {
          await interaction.reply({ content: "Command not found!", ephemeral: true });
          return;
        }

        if (command.admin) {
          if (!isAdmin) {
            await interaction.reply({
              content: "You do not have permission to execute this command!",
              ephemeral: true,
            });
            return;
          }
        }

        if (command && interaction.isChatInputCommand()) {
          try {
            await command.execute(interaction);
          } catch (error) {
            this.loggerError(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
          }
        }
      }
    });

    this.client.on(Events.GuildCreate, (guild) => {
      if (this.isValidGuild(guild.id)) {
        this.loggerInfo(`Joined guild: ${guild.name}`);
        this.registerSlashCommand(guild.id, guild.name);
      } else {
        this.loggerWarning(`Left guild: ${guild.name}`);
        guild.leave().catch(() => {
          this.loggerError(`Failed to leave guild ${guild.name}#${guild.id} on join event.`);
        });
      }
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      this.registerSlashCommands();
      this.registerMessageStacks();
      this.loggerInfo(`Ready! Logged in as ${readyClient.user.tag}`);
    });
  }
  public async start() {
    return this.client.login(this.token);
  }
  private async registerSlashCommand(guildId: string, guildName: string) {
    if (!this.slashCommands) {
      return;
    }

    const commands = this.slashCommands.map((command) => {
      const description = command.admin ? `[Only for administrators] ${command.description}` : command.description;
      const slashCMD = new SlashCommandBuilder().setName(command.name).setDescription(description);

      if (command.args) {
        command.args.forEach((arg) => {
          if (arg.type === "string") {
            slashCMD.addStringOption((option) => {
              const argOption = option.setName(arg.filed).setDescription(arg.description);
              if (arg.required) {
                argOption.setRequired(true);
              }
              return argOption;
            });
          } else if (arg.type === "attachment") {
            slashCMD.addAttachmentOption((option) => {
              const argOption = option.setName(arg.filed).setDescription(arg.description);
              if (arg.required) {
                argOption.setRequired(true);
              }
              return argOption;
            });
          }
        });
      }

      return slashCMD;
    });

    try {
      await this.rest.put(Routes.applicationGuildCommands(this.clientId, guildId), { body: commands });
      this.loggerInfo(`Slash ${commands.length} commands registered for guild ID: ${guildId} (${guildName})`);

      const p = new Table({
        columns: [
          { name: "name", alignment: "left" },
          { name: "description", alignment: "left" },
        ],
      });
      p.addRows(commands.map((item) => ({ name: item.name, description: item.description })));
      p.printTable();
    } catch (error) {
      this.loggerError("Failed to register slash commands for guild ID: " + guildId);
    }
  }
  private async registerSlashCommands() {
    if (!this.client.guilds.cache.size) {
      return;
    }

    if (!this.slashCommands) {
      return;
    }

    for (const guildId of this.guildsID) {
      try {
        if (this.isValidGuild(guildId)) {
          const guild = this.client.guilds.cache.get(guildId);

          if (!guild) {
            this.loggerWarning(`Guild ID: ${guildId} not found.`);
            continue;
          }

          const guildName = this.client.guilds.cache.get(guildId)!.name;
          await this.registerSlashCommand(guildId, guildName);
        }
      } catch (error) {
        this.loggerError(`Failed to register slash commands for guild ID: ${guildId} ${error}`);
      }
    }
  }
  private registerMessageStacks() {
    if (!this.messageStacks) {
      return;
    }

    for (const messageStack of this.messageStacks) {
      for (const channelID of messageStack.channelsID) {
        const channel = this.client.channels.cache.get(channelID) as DiscordJSType.TextChannel;

        if (!channel) {
          this.loggerWarning(`Channel ID: ${channelID} not found for ${messageStack.content}.`);
          continue;
        }

        const cronAction = () => {
          (async () => {
            try {
              if (typeof messageStack.content === "string") {
                Boolean(messageStack.content) && (await channel.send(messageStack.content));
              } else if (
                typeof messageStack.content === "function" &&
                messageStack.content.constructor.name === "AsyncFunction"
              ) {
                const content = await messageStack.content();
                Boolean(content) && (await channel.send(content));
              } else if (typeof messageStack.content === "function") {
                const content = (messageStack.content as Function)();
                Boolean(content) && (await channel.send(content));
              } else {
                this.loggerError(
                  `Invalid messageStack content type for channel ID: ${channelID} for ${messageStack.content}`
                );
              }
            } catch (error) {
              this.loggerError(error);
              this.loggerError(`Failed to send message to channel ID: ${channelID} for ${messageStack.content}`);
            }
          })();
        };

        if (Array.isArray(messageStack.cron)) {
          messageStack.cron.forEach((cronExpression) => {
            cron.schedule(cronExpression, cronAction);
          });
        } else {
          cron.schedule(messageStack.cron, cronAction);
        }
      }
    }
  }
}

export { DiscordJSAPI };

export type { DiscordJSType };
