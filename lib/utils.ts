export function toCamelCase(string: string) {
    return string.replace(/-\w/ig, (part) => part.slice(1).toUpperCase());
}