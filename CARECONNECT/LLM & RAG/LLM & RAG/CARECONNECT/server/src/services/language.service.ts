export function detectLanguage(text: string): "en" | "hi" | "mr" {
  if (!/[\u0900-\u097f]/u.test(text)) return "en";
  return /(आहे|मला|दुखत|रुग्ण|मराठी)/u.test(text) ? "mr" : "hi";
}