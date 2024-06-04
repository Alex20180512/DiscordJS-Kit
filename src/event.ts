import { MetaConfig } from "./meta";
import { BotProps } from "./type";

export class Event<L> extends MetaConfig<L> {
  constructor(props: BotProps<L>) {
    super(props);
  }
  public get event() {
    return {
      listening: <T = Required<BotProps<L>>["on"][number]["label"]>(event: T) => {},
      removeListening: <T = Required<BotProps<L>>["on"][number]["label"]>(event: T) => {},
    };
  }
}
