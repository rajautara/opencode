import { render, useTerminalDimensions } from "@opentui/solid"
import { Match, Switch, createSignal } from "solid-js"
import { theme } from "./theme"
import { Home } from "./routes/home"
import { Session } from "./routes/session"

// ── Route system ────────────────────────────────────────────

export type Route =
  | { type: "home" }
  | { type: "session"; initialMessage?: string }

const [route, setRoute] = createSignal<Route>({ type: "home" })

export function navigate(r: Route) {
  setRoute(r)
}

// ── Root component ──────────────────────────────────────────

function App(props: { onExit: () => void }) {
  const dimensions = useTerminalDimensions()

  return (
    <box
      width={dimensions().width}
      height={dimensions().height}
      backgroundColor={theme.background}
      flexDirection="column"
    >
      <Switch>
        <Match when={route().type === "home"}>
          <Home />
        </Match>
        <Match when={route().type === "session"}>
          {/* Extract initialMessage via accessor so it's reactive-safe */}
          {(() => {
            const r = route()
            const msg = r.type === "session" ? r.initialMessage : undefined
            return <Session initialMessage={msg} />
          })()}
        </Match>
      </Switch>
    </box>
  )
}

// ── Entry point ─────────────────────────────────────────────

export function startTui(): Promise<void> {
  return new Promise<void>((resolve) => {
    render(
      () => <App onExit={resolve} />,
      {
        targetFps: 60,
        exitOnCtrlC: false, // handled manually in each route via ctrl+c key handler
      },
    )
  })
}
