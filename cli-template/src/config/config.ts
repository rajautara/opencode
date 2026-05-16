import fs from "fs/promises"
import path from "path"
import z from "zod"

const ConfigSchema = z.object({
  model: z.string().default("claude-sonnet-4-5"),
  apiKey: z.string().optional(),
})

export type AppConfig = z.infer<typeof ConfigSchema>

let _config: AppConfig | undefined

export namespace Config {
  export async function load(): Promise<AppConfig> {
    if (_config) return _config

    let raw: Record<string, unknown> = {}

    // 1. Load from local config.json if it exists
    const localPath = path.join(process.cwd(), "config.json")
    try {
      const content = await fs.readFile(localPath, "utf8")
      raw = JSON.parse(content)
    } catch {
      // no local config, that's fine
    }

    // 2. Env var overrides (APP_MODEL, ANTHROPIC_API_KEY)
    if (process.env.APP_MODEL) raw.model = process.env.APP_MODEL
    if (process.env.ANTHROPIC_API_KEY) raw.apiKey = process.env.ANTHROPIC_API_KEY

    _config = ConfigSchema.parse(raw)
    return _config
  }

  export async function get(): Promise<AppConfig> {
    return _config ?? load()
  }
}
