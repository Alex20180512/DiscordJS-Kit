import { Logger } from "./logger";
import { BotProps } from "./type";
import { DiscordJSType } from ".";
import { Client, GatewayIntentBits, Partials, REST } from "discord.js";

export class Base<L> extends Logger {
  public client: DiscordJSType.Client;
  public rest: DiscordJSType.REST;
  private props: BotProps<L>;
  constructor(props: BotProps<L>) {
    super(props.meta.appName, props.meta.logToFile);

    this.props = props;
    this.valid();

    this.rest = new REST().setToken(this.token);
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.DirectMessagePolls,
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
  private valid() {
    if (this.events) {
      const eventLabel = new Set();
      for (const event of this.events) {
        if (eventLabel.has(event.label)) {
          throw new Error(`Event label ${event.label} already exists`);
        }
        eventLabel.add(event.label);
      }
    }
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
  public getEventAction(name: unknown) {
    if (!this.events) {
      return null;
    }

    const event = this.events.find((event) => event.label === name);
    if (event) {
      return event;
    }

    return null;
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
