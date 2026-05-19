import { RGBA } from "@opentui/core"

export const theme = {
  // Brand
  primary: RGBA.fromInts(250, 178, 131),    // warm orange
  secondary: RGBA.fromInts(198, 120, 221),  // purple
  accent: RGBA.fromInts(86, 182, 194),      // cyan

  // Status
  error: RGBA.fromInts(224, 108, 117),
  warning: RGBA.fromInts(229, 192, 123),
  success: RGBA.fromInts(152, 195, 121),
  info: RGBA.fromInts(97, 175, 239),

  // Text
  text: RGBA.fromInts(171, 178, 191),
  textMuted: RGBA.fromInts(92, 99, 112),

  // Backgrounds
  background: RGBA.fromInts(0, 0, 0, 0),       // transparent (uses terminal bg)
  backgroundPanel: RGBA.fromInts(33, 37, 43),   // sidebar / message panel
  backgroundElement: RGBA.fromInts(40, 44, 52), // input / hover

  // Borders
  border: RGBA.fromInts(62, 68, 81),
  borderActive: RGBA.fromInts(82, 139, 255),
} as const

// Left-border decoration identical to OpenCode's SplitBorder
export const splitBorder = {
  border: ["left" as const],
  customBorderChars: {
    topLeft: "", bottomLeft: "", vertical: "┃",
    topRight: "", bottomRight: "", horizontal: " ",
    bottomT: "", topT: "", cross: "", leftT: "", rightT: "",
  },
}
