export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // Zastąp wszystko poza literami, cyframi i '-' na '-'
        .replace(/-+/g, '-') // Usuń wiele '-' z rzędu
        .replace(/^-|-$/g, ''); // Usuń '-' na początku i końcu
}