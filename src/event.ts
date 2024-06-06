import { ClientEvents, PermissionFlagsBits, PermissionsBitField, User } from "discord.js";
import { Base } from "./base";
import { BotProps } from "./type";

export class Event<L> extends Base<L> {
  private listeners = new Map();
  constructor(props: BotProps<L>) {
    super(props);
  }
  public get event() {
    return {
      listening: <T = Required<BotProps<L>>["on"][number]["label"]>(label: T) => {
        const event = this.getEventAction(label);
        if (!event) return;
        if (this.listeners.has(label)) return;

        const action = async (...args: Parameters<typeof event.action>) => {
          if (event.name === "messageReactionAdd" || event.name === "messageReactionRemove") {
            const [reaction, user] = args;
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (event.channelsID && event.channelsID.length > 0) {
              if (!event.channelsID.includes(reaction.message.channelId)) return;
            }

            if (event.roles && event.roles.length > 0) {
              const member = await reaction.message.guild.members.fetch({ user: user as User });
              if (member) {
                const roles = member.roles.cache;
                if (!event.roles.some((role) => roles.has(role))) return;
              }
            }
          }

          event.action.apply(null, args);
        };

        this.listeners.set(label, action);
        this.client.on(event.name, action);
      },
      removeListening: <T = Required<BotProps<L>>["on"][number]["label"]>(label: T) => {
        const event = this.getEventAction(label);
        if (!event) return;
        if (!this.listeners.has(label)) return;
        this.client.off(event.name, this.listeners.get(label));
        this.listeners.delete(label);
      },
    };
  }
}
