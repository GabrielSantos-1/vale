export function sanitizeString(input: string) {
  return input.replace(/[<>]/g, '')
}

export default sanitizeString
export function sanitizeInput(str: string) {
  return str.replace(/[<>]/g, '');
}
