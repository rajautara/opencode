import { createSignal, onMount } from "solid-js"
import { useTerminalDimensions, useRenderer } from "@opentui/solid"
import { TextareaRenderable } from "@opentui/core"
import { theme } from "../theme"
import { navigate } from "../app"

const APP_NAME = "my-cli"
const VERSION = "0.1.0"

export function Home() {
  const dimensions = useTerminalDimensions()
  const renderer = useRenderer()
  let textarea: TextareaRenderable

  onMount(() => {
    textarea?.focus()
  })

  function submit() {
    const text = textarea?.plainText?.trim()
    if (!text) return
    textarea.clear()
    navigate({ type: "session", initialMessage: text })
  }

  return (
    <>
      {/* Main centered area */}
      <box flexGrow={1} justifyContent="center" alignItems="center" paddingLeft={2} paddingRight={2} gap={1}>

        {/* Logo / app name */}
        <box flexDirection="column" alignItems="center" gap={0}>
          <text fg={theme.primary} attributes={1 /* BOLD */}>
            {APP_NAME}
          </text>
          <text fg={theme.textMuted}>AI-powered CLI</text>
        </box>

        {/* Input box — max 75 cols, identical sizing to OpenCode home */}
        <box width="100%" maxWidth={75} zIndex={1000} paddingTop={1}>
          <box
            border={["left"]}
            borderColor={theme.accent}
            customBorderChars={{
              topLeft: "", bottomLeft: "", vertical: "┃",
              topRight: "", bottomRight: "", horizontal: " ",
              bottomT: "", topT: "", cross: "", leftT: "", rightT: "",
            }}
          >
            <box
              paddingLeft={2}
              paddingRight={2}
              paddingTop={1}
              backgroundColor={theme.backgroundElement}
              flexGrow={1}
            >
              <textarea
                ref={(r) => (textarea = r)}
                placeholder={`Ask anything or type a command…`}
                textColor={theme.text}
                focusedTextColor={theme.text}
                minHeight={1}
                maxHeight={6}
                onKeyDown={(e) => {
                  if (e.name === "return" && !e.shift && !e.ctrl) {
                    e.preventDefault()
                    submit()
                  }
                  if (e.ctrl && e.name === "c") {
                    renderer.destroy()
                    process.exit(0)
                  }
                }}
              />
            </box>
          </box>
          {/* Hint line */}
          <box paddingLeft={3} paddingTop={1}>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.textMuted }}>enter</span> to send ·{" "}
              <span style={{ fg: theme.textMuted }}>shift+enter</span> newline ·{" "}
              <span style={{ fg: theme.textMuted }}>ctrl+c</span> exit
            </text>
          </box>
        </box>

      </box>

      {/* Footer bar — same structure as OpenCode home footer */}
      <box
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
        flexDirection="row"
        flexShrink={0}
        gap={2}
      >
        <text fg={theme.textMuted}>{process.cwd()}</text>
        <box flexGrow={1} />
        <text fg={theme.textMuted}>{VERSION}</text>
      </box>
    </>
  )
}
