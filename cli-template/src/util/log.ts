import path from "path"
import fs from "fs/promises"
import os from "os"

export namespace Log {
  export type Level = "DEBUG" | "INFO" | "WARN" | "ERROR"

  const levelPriority: Record<Level, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  }

  let currentLevel: Level = "INFO"

  function shouldLog(input: Level): boolean {
    return levelPriority[input] >= levelPriority[currentLevel]
  }

  export type Logger = {
    debug(message?: any, extra?: Record<string, any>): void
    info(message?: any, extra?: Record<string, any>): void
    warn(message?: any, extra?: Record<string, any>): void
    error(message?: any, extra?: Record<string, any>): void
    clone(): Logger
  }

  let logpath = ""
  export function file() {
    return logpath
  }

  let write = (msg: string) => {
    process.stderr.write(msg)
  }

  export interface Options {
    print?: boolean
    level?: Level
    appName?: string
  }

  export async function init(options: Options = {}) {
    if (options.level) currentLevel = options.level
    if (options.print) return

    const dataDir =
      process.env.XDG_DATA_HOME ??
      (process.platform === "win32"
        ? process.env.APPDATA ?? os.homedir()
        : path.join(os.homedir(), ".local", "share"))

    const logDir = path.join(dataDir, options.appName ?? "my-cli", "logs")
    await fs.mkdir(logDir, { recursive: true })

    logpath = path.join(logDir, new Date().toISOString().split(".")[0].replace(/:/g, "") + ".log")
    const logStream = await fs.open(logpath, "a")

    write = (msg: string) => {
      logStream.write(msg).catch(() => {})
    }
  }

  let last = Date.now()

  function build(tags: Record<string, any>, message: any, extra?: Record<string, any>): string {
    const merged = { ...tags, ...extra }
    const kvPairs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join(" ")
    const now = Date.now()
    const diff = now - last
    last = now
    return [new Date().toISOString().split(".")[0], `+${diff}ms`, kvPairs, message]
      .filter(Boolean)
      .join(" ") + "\n"
  }

  export function create(tags: Record<string, any> = {}): Logger {
    return {
      debug(message, extra) {
        if (shouldLog("DEBUG")) write("DEBUG " + build(tags, message, extra))
      },
      info(message, extra) {
        if (shouldLog("INFO")) write("INFO  " + build(tags, message, extra))
      },
      warn(message, extra) {
        if (shouldLog("WARN")) write("WARN  " + build(tags, message, extra))
      },
      error(message, extra) {
        if (shouldLog("ERROR")) write("ERROR " + build(tags, message, extra))
      },
      clone() {
        return create({ ...tags })
      },
    }
  }

  export const Default = create({ service: "cli" })
}
