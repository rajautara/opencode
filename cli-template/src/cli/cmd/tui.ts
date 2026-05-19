import { cmd } from "./cmd"

export const TuiCommand = cmd({
  command: "tui",
  describe: "start the interactive TUI (OpenCode-style layout)",
  builder: (yargs) =>
    yargs.option("model", {
      type: "string",
      alias: "m",
      describe: "model to use (e.g. claude-sonnet-4-5)",
    }),
  async handler(args) {
    // Override model if passed as flag
    if (args.model) {
      process.env.APP_MODEL = args.model
    }

    // Lazy-load the TUI so the terminal renderer only starts when this command runs
    const { startTui } = await import("../../tui/app")
    await startTui()
  },
})
