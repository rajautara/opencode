import { cmd } from "./cmd"
import { UI } from "../ui"

export const HelloCommand = cmd({
  command: "hello [name]",
  describe: "greet someone",
  builder: (yargs) =>
    yargs.positional("name", {
      type: "string",
      describe: "name to greet",
      default: "World",
    }),
  async handler(args) {
    UI.println(UI.Style.TEXT_SUCCESS_BOLD + "Hello, " + UI.bold(args.name!) + "!")
    UI.info("This is a simple non-interactive command.")
  },
})
