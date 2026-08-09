// Splits raw extracted PDF text into roughly equal daily portions.
// True discourse/chapter-boundary detection from arbitrary PDFs is
// unreliable, so this uses a word-count target and snaps to the nearest
// sentence end nearby — imperfect boundaries stay editable afterward.
export function splitIntoPortions(rawText: string, targetWords: number): string[] {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
  if (!normalized) return []

  const words = normalized.split(/\s+/)
  if (words.length <= targetWords) return [normalized]

  const portions: string[] = []
  let start = 0

  while (start < words.length) {
    let end = Math.min(start + targetWords, words.length)

    // Look up to 100 words further for a sentence-ending boundary.
    if (end < words.length) {
      const lookahead = Math.min(end + 100, words.length)
      let boundary = -1
      for (let i = end; i < lookahead; i++) {
        if (/[.!?]["')]?$/.test(words[i])) {
          boundary = i + 1
          break
        }
      }
      if (boundary !== -1) end = boundary
    }

    portions.push(words.slice(start, end).join(' ').trim())
    start = end
  }

  return portions.filter((p) => p.length > 0)
}
