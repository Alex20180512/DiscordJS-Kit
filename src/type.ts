import { CacheType, ChatInputCommandInteraction, ClientEvents } from "discord.js";

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

type AllowedEvents = "messageReactionAdd";

type PickAllowedEvents = Pick<ClientEvents, AllowedEvents>;

type EventHandler<T extends keyof PickAllowedEvents> = {
  [P in T]: {
    isAdmin?: boolean;
    channelID?: string;
    label: string;
    name: P;
    action: (...args: PickAllowedEvents[P]) => void;
  };
}[T];

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
  on?: EventHandler<AllowedEvents>[];
}

export type EventLabel<T extends BotProps> = T["on"] extends Array<infer U>
  ? U extends { label: infer L }
    ? L
    : never
  : never;