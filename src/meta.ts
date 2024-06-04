import { Logger } from "./logger";
import { BotProps } from "./type";
import { DiscordJSType } from ".";
import { Client, GatewayIntentBits, Partials, REST } from "discord.js";

export class MetaConfig<L> extends Logger {
  public client: DiscordJSType.Client;
  public rest: DiscordJSType.REST;
  private props: BotProps<L>;
  constructor(props: BotProps<L>) {
    super(props.meta.appName, props.meta.logToFile);
    this.props = props;

    this.rest = new REST().setToken(this.token);
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
      ],
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
      ],
    });
  }
  public get token() {
    return this.props.meta.token;
  }
  public get clientId() {
    return this.props.meta.clientID;
  }
  public get guildsID() {
    return this.props.meta.guildsID;
  }
  public get slashCommands() {
    return this.props.slashCommands;
  }
  public get messageStacks() {
    return this.props.messageStacks;
  }
  public get events() {
    return this.props.on;
  }
  public getSlashCommandExecuteAction(name: string) {
    if (!this.slashCommands) {
      return null;
    }

    const command = this.slashCommands.find((command) => command.name === name);
    if (command) {
      return command;
    }

    return null;
  }
  public isValidGuild(guildID: string) {
    return this.guildsID.includes(guildID);
  }
}
