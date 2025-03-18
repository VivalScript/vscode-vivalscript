
export function isInsideComment(line: string, char: number): boolean {
        return line.includes('#') && char > line.indexOf('#');
}

export function cleanPath(path: string): string {
        if (path.startsWith('/') && path.startsWith(':/', 2)) {
                path = path.substring(1);
        }
        return path;
}
