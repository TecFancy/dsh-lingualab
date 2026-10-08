/**
 * Reading subtitle bytes, and cleaning the text once they are decoded.
 *
 * Ported from `TecFancy/repeater` (`features/subtitle-parser/lib/`), where the
 * two hard cases were found the hard way.
 *
 * **Encoding.** A browser's `Blob.text()` always decodes as UTF-8, and a large
 * share of Chinese bilingual subtitles in the wild are GBK or GB18030. Decoded
 * as UTF-8 they turn into replacement characters while the ASCII English looks
 * fine — which reads like a rendering bug rather than an encoding one. The BOM
 * decides first, then a strict UTF-8 attempt, then GB18030 as the fallback.
 *
 * **Style tags.** Subtitles converted out of ASS/SSA carry inline override
 * blocks such as `{\fs16\an2\b0}`, hard line breaks written as `\N`, and HTML
 * font tags. Rendered as plain text they are noise in front of every line.
 */

/** Decode subtitle bytes: BOM first, then strict UTF-8, then GB18030. */
export function decodeSubtitleText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes)
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes)

  try {
    // Strict mode throws on an invalid sequence, which is the probe: a decoder
    // that never fails cannot tell UTF-8 from GB18030.
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('gb18030').decode(bytes)
  }
}

/** Strip ASS/SSA override blocks, hard breaks and HTML tags; keep the words. */
export function stripStyleTags(text: string): string {
  return text
    .replace(/\{\\[^}]*\}/g, '')
    .replace(/\\[Nn]/g, '\n')
    .replace(/\\h/g, ' ')
    .replace(/<\/?(?:font|i|b|u)\b[^>]*>/gi, '')
    .trim()
}
