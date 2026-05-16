import { cmd } from "./cmd"
import * as prompts from "@clack/prompts"
import { UI } from "../ui"
import { LLM } from "../../ai/llm"

export const AskCommand = cmd({
  command: "ask [question]",
  describe: "ask the AI a question",
  builder: (yargs) =>
    yargs
      .positional("question", {
        type: "string",
        describe: "question to ask",
      })
      .option("system", {
        type: "string",
        alias: "s",
        describe: "system prompt override",
      }),
  async handler(args) {
    UI.empty()
    prompts.intro(UI.Style.TEXT_HIGHLIGHT_BOLD + "AI Assistant" + UI.Style.TEXT_NORMAL)

    // Get question interactively if not provided as arg
    let question = args.question
    if (!question) {
      const input = await prompts.text({
        message: "What would you like to ask?",
        placeholder: "e.g. What is TypeScript?",
        validate(value) {
          if (!value.trim()) return "Please enter a question."
        },
      })

      if (prompts.isCancel(input)) {
        prompts.cancel("Cancelled.")
        process.exit(0)
      }

      question = input as string
    }

    const spinner = prompts.spinner()
    spinner.start("Thinking...")

    try {
      let firstChunk = true
      let fullResponse = ""

      for await (const chunk of LLM.stream(question, args.system)) {
        if (firstChunk) {
          spinner.stop("Response:")
          UI.empty()
          firstChunk = false
        }
        process.stdout.write(chunk)
        fullResponse += chunk
      }

      if (fullResponse) {
        process.stdout.write("\n")
      }
    } catch (e) {
      spinner.stop("Failed.")
      throw e
    }

    UI.empty()
    prompts.outro(UI.Style.TEXT_DIM + "Done" + UI.Style.TEXT_NORMAL)
  },
})
