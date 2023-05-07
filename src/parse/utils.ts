export function find_next_pairing_ignore_quote(open: string, close: string, src: string, start: number) {
    let curr_quote = -1
    let nest = 1
    for (let pos = start; pos < src.length; pos++) {
        let quote = "\"".indexOf(src[pos])
        if (curr_quote == -1) {
            if (quote >= 0) {
                curr_quote = quote

            } else {
                if (src[pos] == close) {
                    if (nest == 1)
                        return pos
                    else {
                        nest--
                    }
                } else if (src[pos] == open) {
                    nest++
                }

            }
        } else if (curr_quote == quote) {
            curr_quote = -1

        }
    }
    return -1
}

/**
 * Only work for target being single character
 */
export function find_next_char(src: string, char: string, ignore: string, start: number, end: number): number {
    for (let i = start; i < end; i++) {
        if (src[i] == char) {
            return i
        } else if (ignore.indexOf(src[i]) > -1) {

        } else {
            break
        }
    }
    return -1
}

export function find_next_char_repeat(src: string, char: string, minimal_repeat: number, start: number, end: number): [number, number] {
    for (let i = start; i < end; i++) {
        if (src[i] == char) {
            let j: number
            for (j = i + 1; j < end; j++) {
                if (src[j] != char) {
                    break
                }
            }
            if (j - i >= minimal_repeat) {
                return [i, j - i]
            }
        }
    }
    return null
}