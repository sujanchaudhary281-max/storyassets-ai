export function checkContentPolicy(text: string): { warnings: string[] } {
  const warnings: string[] = []

  if (/free|sale|[\$€]\d/i.test(text)) {
    warnings.push('Contains pricing or promotional text which may violate store guidelines')
  }

  if (/#1|best|award/i.test(text)) {
    warnings.push('Contains unsubstantiated claims which may be rejected by app stores')
  }

  if (text.length > 40) {
    warnings.push('Text is too long for store screenshots (over 40 characters)')
  }

  return { warnings }
}
