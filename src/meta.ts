import { CacheType, ChatInputCommandInteraction, ClientEvents } from "discord.js";
import { Logger } from "./logger";
import { BotProps } from "./type";

export class MetaConfig extends Logger {
  private props: BotProps;
  constructor(props: BotProps) {
    super(props.meta.appName, props.meta.logToFile);
    this.props = props;
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
