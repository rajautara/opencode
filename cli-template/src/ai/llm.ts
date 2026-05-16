import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"
import { Config } from "../config/config"
import { Log } from "../util/log"

const log = Log.create({ service: "llm" })

export namespace LLM {
  export async function* stream(prompt: string, systemPrompt?: string): AsyncGenerator<string> {
    const config = await Config.get()

    const anthropic = createAnthropic({
      apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "",
    })

    log.info("stream", { model: config.model, promptLength: prompt.length })

    const result = streamText({
      model: anthropic(config.model),
      system: systemPrompt ?? "You are a helpful assistant.",
      prompt,
    })

    for await (const chunk of result.textStream) {
      yield chunk
    }
  }

  export async function complete(prompt: string, systemPrompt?: string): Promise<string> {
    let output = ""
    for await (const chunk of stream(prompt, systemPrompt)) {
      output += chunk
    }
    return output
  }
}
