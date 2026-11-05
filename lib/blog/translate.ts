import type { BlogLang } from "./types"

type TranslateResult = {
  title: string
  excerpt: string
  bodyMd: string
}

function deeplEndpoint(): string {
  const explicit = process.env.DEEPL_API_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const key = process.env.DEEPL_API_KEY || ""
  // Free keys typically end with :fx
  if (key.endsWith(":fx")) return "https://api-free.deepl.com"
  return "https://api.deepl.com"
}

function toDeeplLang(lang: BlogLang): string {
  return lang === "id" ? "ID" : "EN"
}

async function translateText(
  text: string,
  source: BlogLang,
  target: BlogLang
): Promise<string> {
  if (!text.trim()) return text

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    throw new Error("DEEPL_API_KEY is not configured")
  }

  const base = deeplEndpoint()
  const params = new URLSearchParams()
  params.append("text", text)
  params.append("source_lang", toDeeplLang(source))
  params.append("target_lang", toDeeplLang(target))
  params.append("preserve_formatting", "1")

  const res = await fetch(`${base}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(
      `DeepL translate failed (${res.status}): ${detail.slice(0, 200)}`
    )
  }

  const data = (await res.json()) as {
    translations?: { text: string }[]
  }
  const translated = data.translations?.[0]?.text
  if (typeof translated !== "string") {
    throw new Error("DeepL returned no translation")
  }
  return translated
}

/**
 * Translate title, excerpt, and body from source lang to the other locale.
 * Throws on API failure so callers can keep the post as draft.
 */
export async function translatePostContent(
  source: BlogLang,
  fields: { title: string; excerpt: string; bodyMd: string }
): Promise<TranslateResult> {
  const target: BlogLang = source === "en" ? "id" : "en"

  // Sequential to stay under free-tier rate limits and keep order clear
  const title = await translateText(fields.title, source, target)
  const excerpt = await translateText(fields.excerpt || "", source, target)
  const bodyMd = await translateText(fields.bodyMd, source, target)

  return { title, excerpt, bodyMd }
}

export function targetLang(source: BlogLang): BlogLang {
  return source === "en" ? "id" : "en"
}
