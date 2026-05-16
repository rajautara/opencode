import { EOL } from "os"

export namespace UI {
  export const Style = {
    TEXT_HIGHLIGHT: "\x1b[96m",
    TEXT_HIGHLIGHT_BOLD: "\x1b[96m\x1b[1m",
    TEXT_DIM: "\x1b[90m",
    TEXT_DIM_BOLD: "\x1b[90m\x1b[1m",
    TEXT_NORMAL: "\x1b[0m",
    TEXT_NORMAL_BOLD: "\x1b[1m",
    TEXT_WARNING: "\x1b[93m",
    TEXT_WARNING_BOLD: "\x1b[93m\x1b[1m",
    TEXT_DANGER: "\x1b[91m",
    TEXT_DANGER_BOLD: "\x1b[91m\x1b[1m",
    TEXT_SUCCESS: "\x1b[92m",
    TEXT_SUCCESS_BOLD: "\x1b[92m\x1b[1m",
    TEXT_INFO: "\x1b[94m",
    TEXT_INFO_BOLD: "\x1b[94m\x1b[1m",
  }

  let blank = false

  export function print(...message: string[]) {
    blank = false
    process.stderr.write(message.join(" "))
  }

  export function println(...message: string[]) {
    print(...message)
    process.stderr.write(EOL)
  }

  export function empty() {
    if (blank) return
    println("" + Style.TEXT_NORMAL)
    blank = true
  }

  export function error(message: string) {
    println(Style.TEXT_DANGER_BOLD + "Error: " + Style.TEXT_NORMAL + message)
  }

  export function success(message: string) {
    println(Style.TEXT_SUCCESS_BOLD + "✓ " + Style.TEXT_NORMAL + message)
  }

  export function info(message: string) {
    println(Style.TEXT_INFO + message + Style.TEXT_NORMAL)
  }

  export function dim(message: string) {
    return Style.TEXT_DIM + message + Style.TEXT_NORMAL
  }

  export function bold(message: string) {
    return Style.TEXT_NORMAL_BOLD + message + Style.TEXT_NORMAL
  }
}
