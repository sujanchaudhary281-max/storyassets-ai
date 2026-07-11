import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function generateLogoPrompt(appName: string, description: string, category: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'You are an expert app icon designer. Generate a DALL-E 3 prompt for an app logo. The logo should be simple, modern, memorable, and work at small sizes. Output ONLY the prompt text, nothing else.'
    }, {
      role: 'user',
      content: `App: ${appName}\nDescription: ${description}\nCategory: ${category}\nCreate a professional app logo prompt. The logo should be on a solid white background, minimal, flat design, suitable for both iOS and Android.`
    }],
    max_tokens: 200,
  })
  return res.choices[0].message.content ?? `A modern minimalist app logo for ${appName}, flat design, solid white background`
}

export async function generateCaptions(appName: string, description: string, screenshotIndex: number, total: number): Promise<{ headline: string; subtext: string }> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'You write App Store screenshot captions. Output JSON: {"headline": "...", "subtext": "..."}. Headline max 40 chars. Subtext max 80 chars. Be punchy and benefit-focused.'
    }, {
      role: 'user',
      content: `App: ${appName}\nDescription: ${description}\nThis is screenshot ${screenshotIndex + 1} of ${total}. Write a unique caption for this screenshot.`
    }],
    max_tokens: 100,
    response_format: { type: 'json_object' },
  })
  const parsed = JSON.parse(res.choices[0].message.content ?? '{}')
  return { headline: parsed.headline ?? appName, subtext: parsed.subtext ?? description.slice(0, 80) }
}

export { openai }
