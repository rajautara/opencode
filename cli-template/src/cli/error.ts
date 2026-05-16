export function FormatError(e: unknown): string | undefined {
  if (e instanceof Error) {
    return e.message
  }
  if (typeof e === "string") {
    return e
  }
  return undefined
}
