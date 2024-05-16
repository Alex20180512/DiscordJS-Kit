import * as ReadableStream from "web-streams-polyfill";
// @ts-ignore
global.ReadableStream = ReadableStream;

export const polyfill = () => {
  return 'polyfill';
};
