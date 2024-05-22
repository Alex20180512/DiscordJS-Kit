import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Logger } from "./logger";

export type SlashCommand = {
  name: string;
  description: string;
  admin?: boolean;
  args?: { filed: string; required?: boolean; type: "string" | "attachment"; description: string }[];
  execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
};

export type MessageStack = {
  channelsID: string[];
  content: string | (() => string) | (() => Promise<string>);
  cron: string | string[];
};

export interface BotProps {
  meta: {
    logToFile?: boolean;
    appName: string;
    token: string;
    clientID: string;
    guildsID: string[];
  };
  messageStacks?: MessageStack[];
  slashCommands?: SlashCommand[];
}

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
