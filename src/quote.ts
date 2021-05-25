export function quote(str: string) {
  if (str.includes(' ')) return `"${str}"`;
  return str;
}
