export function normalize_text(src: string) {
    let splitted_lines = src.trim().split("\n")
    let normalized_lines = []
    let prev_change_line = false
    for (let line of splitted_lines) {
        let trimed = line.trim()
        if (trimed.length == 0) {
            prev_change_line = true
            continue
        }
        if (prev_change_line) {
            normalized_lines.push("\n")
        }
        prev_change_line = false
        let normalized_line = trimed.replace(/\s\s+/g, ' ')
        normalized_lines.push(normalized_line)
    }
    return normalized_lines.join("\n")
}