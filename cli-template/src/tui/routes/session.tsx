import { createSignal, createEffect, For, Show, onMount } from "solid-js"
import { useTerminalDimensions, useRenderer } from "@opentui/solid"
import { TextareaRenderable, ScrollBoxRenderable } from "@opentui/core"
import { theme, splitBorder } from "../theme"
import { navigate } from "../app"
import { LLM } from "../../ai/llm"

export type Message = {
  id: string
  role: "user" | "assistant"
  text: string
  streaming?: boolean
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

export function Session(props: { initialMessage?: string }) {
  const dimensions = useTerminalDimensions()
  const renderer = useRenderer()

  const [messages, setMessages] = createSignal<Message[]>([])
  const [running, setRunning] = createSignal(false)
  const [spinnerFrame, setSpinnerFrame] = createSignal(0)
  const [title, setTitle] = createSignal("New session")

  let textarea: TextareaRenderable
  let scrollbox: ScrollBoxRenderable

  // Responsive: show sidebar if terminal is wide enough
  const wide = () => dimensions().width > 120
  const contentWidth = () => dimensions().width - (wide() ? 42 : 0) - 4

  // Spinner animation
  let spinnerTimer: ReturnType<typeof setInterval>
  createEffect(() => {
    if (running()) {
      spinnerTimer = setInterval(() => {
        setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length)
      }, 80)
    } else {
      clearInterval(spinnerTimer)
    }
  })

  function scrollToBottom() {
    setTimeout(() => {
      if (!scrollbox || (scrollbox as any).isDestroyed) return
      scrollbox.scrollTo(scrollbox.scrollHeight)
    }, 50)
  }

  async function sendMessage(text: string) {
    if (!text.trim() || running()) return

    // Update session title from first message
    if (messages().length === 0) {
      setTitle(text.length > 40 ? text.slice(0, 37) + "…" : text)
    }

    const userID = crypto.randomUUID()
    const assistantID = crypto.randomUUID()

    setMessages((prev) => [
      ...prev,
      { id: userID, role: "user", text },
      { id: assistantID, role: "assistant", text: "", streaming: true },
    ])
    setRunning(true)
    scrollToBottom()

    try {
      for await (const chunk of LLM.stream(text)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantID ? { ...m, text: m.text + chunk } : m)),
        )
        scrollToBottom()
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantID ? { ...m, text: `Error: ${err}` } : m)),
      )
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantID ? { ...m, streaming: false } : m)),
      )
      setRunning(false)
      scrollToBottom()
    }
  }

  onMount(() => {
    textarea?.focus()
    if (props.initialMessage) {
      sendMessage(props.initialMessage)
    }
  })

  function submit() {
    const text = textarea?.plainText?.trim()
    if (!text) return
    textarea.clear()
    sendMessage(text)
  }

  return (
    <box flexDirection="row">

      {/* ─── Main panel ─────────────────────────────────────── */}
      <box flexGrow={1} paddingBottom={1} paddingTop={1} paddingLeft={2} paddingRight={2} gap={1}>

        {/* Header: session title */}
        <box
          flexShrink={0}
          border={["left"]}
          borderColor={theme.border}
          customBorderChars={splitBorder.customBorderChars}
          backgroundColor={theme.backgroundPanel}
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          paddingRight={1}
        >
          <text fg={theme.text} attributes={1 /* BOLD */}>{title()}</text>
        </box>

        {/* Scrollable message list */}
        <scrollbox
          ref={(r) => (scrollbox = r)}
          stickyScroll={true}
          stickyStart="bottom"
          flexGrow={1}
        >
          <For each={messages()}>
            {(message, index) => (
              <Show
                when={message.role === "user"}
                fallback={<AssistantMsg message={message} spinner={SPINNER_FRAMES[spinnerFrame()]} />}
              >
                <UserMsg message={message} first={index() === 0} />
              </Show>
            )}
          </For>
        </scrollbox>

        {/* Input area */}
        <box flexShrink={0}>
          <box
            border={["left"]}
            borderColor={running() ? theme.accent : theme.primary}
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
                placeholder="Ask a follow-up…"
                textColor={running() ? theme.textMuted : theme.text}
                focusedTextColor={running() ? theme.textMuted : theme.text}
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
                  // Go back to home on escape when input is empty
                  if (e.name === "escape" && !textarea?.plainText?.trim()) {
                    navigate({ type: "home" })
                  }
                }}
              />
            </box>
          </box>

          {/* Input status line */}
          <box paddingLeft={3} paddingTop={1}>
            <Show
              when={running()}
              fallback={
                <text fg={theme.textMuted}>
                  <span style={{ fg: theme.textMuted }}>enter</span> send ·{" "}
                  <span style={{ fg: theme.textMuted }}>esc</span> home
                </text>
              }
            >
              <text fg={theme.accent}>
                {SPINNER_FRAMES[spinnerFrame()]} generating…{" "}
                <span style={{ fg: theme.textMuted }}>ctrl+c exit</span>
              </text>
            </Show>
          </box>
        </box>

        {/* Footer */}
        <Footer messageCount={messages().length} />
      </box>

      {/* ─── Sidebar (wide terminals only) ───────────────────── */}
      <Show when={wide()}>
        <Sidebar title={title()} messageCount={messages().length} running={running()} />
      </Show>

    </box>
  )
}

// ── Sub-components ───────────────────────────────────────────

function UserMsg(props: { message: Message; first: boolean }) {
  return (
    <box
      id={props.message.id}
      border={["left"]}
      borderColor={theme.primary}
      customBorderChars={splitBorder.customBorderChars}
      marginTop={props.first ? 0 : 1}
    >
      <box
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        backgroundColor={theme.backgroundPanel}
        flexShrink={0}
      >
        <text fg={theme.text}>{props.message.text}</text>
      </box>
    </box>
  )
}

function AssistantMsg(props: { message: Message; spinner: string }) {
  return (
    <box paddingLeft={3} marginTop={1} flexShrink={0}>
      <Show
        when={props.message.text}
        fallback={
          <text fg={theme.textMuted}>{props.spinner} thinking…</text>
        }
      >
        {/* OpenCode uses <code filetype="markdown"> here for syntax highlighting.
            Replace <text> with <code filetype="markdown" content={...}> once you
            add a tree-sitter parser via addDefaultParsers(). */}
        <text fg={theme.text}>{props.message.text}</text>
        <Show when={props.message.streaming}>
          <text fg={theme.accent}> ▊</text>
        </Show>
      </Show>
    </box>
  )
}

function Footer(props: { messageCount: number }) {
  return (
    <box flexDirection="row" justifyContent="space-between" gap={1} flexShrink={0}>
      <text fg={theme.textMuted}>{process.cwd()}</text>
      <box flexDirection="row" gap={2} flexShrink={0}>
        <text fg={theme.textMuted}>
          <span style={{ fg: theme.success }}>•</span> {props.messageCount} messages
        </text>
        <text fg={theme.textMuted}>/help</text>
      </box>
    </box>
  )
}

function Sidebar(props: { title: string; messageCount: number; running: boolean }) {
  return (
    <box
      backgroundColor={theme.backgroundPanel}
      width={42}
      height="100%"
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
    >
      <scrollbox flexGrow={1}>
        <box flexShrink={0} gap={1} paddingRight={1}>

          {/* Session title */}
          <box paddingRight={1}>
            <text fg={theme.text} attributes={1 /* BOLD */}>{props.title}</text>
          </box>

          {/* Stats */}
          <box>
            <text fg={theme.text} attributes={1 /* BOLD */}>Session</text>
            <text fg={theme.textMuted}>{props.messageCount} messages</text>
            <Show when={props.running}>
              <text fg={theme.accent}>● running</text>
            </Show>
          </box>

          {/* Directory */}
          <box>
            <text fg={theme.text} attributes={1 /* BOLD */}>Directory</text>
            <text fg={theme.textMuted}>{process.cwd()}</text>
          </box>

          {/* Keybindings hint */}
          <box marginTop={1}>
            <text fg={theme.text} attributes={1 /* BOLD */}>Keys</text>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.text }}>enter</span>    send
            </text>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.text }}>shift+enter</span> newline
            </text>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.text }}>esc</span>       back to home
            </text>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.text }}>ctrl+c</span>    exit
            </text>
          </box>

        </box>
      </scrollbox>
    </box>
  )
}
