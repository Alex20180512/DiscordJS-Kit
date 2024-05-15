import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { BotProps, MetaConfig } from "./meta";

export class Bot extends MetaConfig {
  public client: Client;
  public rest: REST;
  constructor(props: BotProps) {
    super(props);

    this.rest = new REST().setToken(this.token);

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      partials: [Partials.User, Partials.GuildMember],
    });

    this.client.on(Events.Error, this.loggerError);

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isCommand()) {
        const memberPermissions = interaction.member!.permissions as Readonly<PermissionsBitField>;
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
      this.loggerInfo(`Ready! Logged in as ${readyClient.user.tag}`);
    });
  }
  public async start() {
    return this.client.login(this.token);
  }
  public async registerSlashCommand(guildId: string, guildName: string) {
    if (!this.slashCommands) {
      return;
    }

    const commands = this.slashCommands.map((command) => {
      const slashCMD = new SlashCommandBuilder().setName(command.name).setDescription(command.description);

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
    } catch (error) {
      this.loggerError("Failed to register slash commands for guild ID: " + guildId);
    }
  }
  public async registerSlashCommands() {
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
}
