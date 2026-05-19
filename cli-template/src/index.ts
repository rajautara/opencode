import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { Log } from "./util/log"
import { UI } from "./cli/ui"
import { FormatError } from "./cli/error"
import { HelloCommand } from "./cli/cmd/hello"
import { AskCommand } from "./cli/cmd/ask"
import { TuiCommand } from "./cli/cmd/tui"

process.on("unhandledRejection", (e) => {
  Log.Default.error("rejection", { e: e instanceof Error ? e.message : e })
})

process.on("uncaughtException", (e) => {
  Log.Default.error("exception", { e: e instanceof Error ? e.message : e })
})

const cli = yargs(hideBin(process.argv))
  .parserConfiguration({ "populate--": true })
  .scriptName("my-cli")
  .wrap(100)
  .help("help", "show help")
  .alias("help", "h")
  .version("version", "show version", "0.1.0")
  .alias("version", "v")
  .option("log-level", {
    describe: "log level",
    type: "string",
    choices: ["DEBUG", "INFO", "WARN", "ERROR"] as const,
  })
  .option("print-logs", {
    describe: "print logs to stderr instead of a file",
    type: "boolean",
  })
  .middleware(async (opts) => {
    await Log.init({
      print: Boolean(opts.printLogs),
      level: (opts.logLevel as Log.Level) ?? "INFO",
      appName: "my-cli",
    })
    Log.Default.info("start", { args: process.argv.slice(2) })
  })
  .command(HelloCommand)
  .command(AskCommand)
  .command(TuiCommand)
  .demandCommand(1, "Please specify a command. Use --help to see available commands.")
  .fail((msg, err) => {
    if (
      msg?.startsWith("Unknown argument") ||
      msg?.startsWith("Not enough non-option arguments") ||
      msg?.startsWith("Invalid values:")
    ) {
      if (err) throw err
      cli.showHelp("log")
    }
    if (err) throw err
    process.exit(1)
  })
  .strict()

try {
  await cli.parse()
} catch (e) {
  Log.Default.error("fatal", { e: e instanceof Error ? e.message : e })
  const formatted = FormatError(e)
  if (formatted) {
    UI.error(formatted)
  } else {
    UI.error("Unexpected error. Run with --print-logs for details.")
    console.error(e instanceof Error ? e.message : String(e))
  }
  process.exitCode = 1
} finally {
  process.exit()
}
