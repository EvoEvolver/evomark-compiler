
export function find_next_pairing_ignore_quote(open: string, close: string, src: string, start: number) {
    let curr_quote = -1
    let nest = 1
    for (let pos = start; pos < src.length; pos++) {
        let quote = "\"'".indexOf(src[pos])
        if (curr_quote == -1) {
            if (quote >= 0) {
                curr_quote = quote
                continue
            }
            else {
                if (src[pos] == close) {
                    if (nest == 1)
                        return pos
                    else {
                        nest--
                    }
                }
                else if (src[pos] == open) {
                    nest++
                }
                continue
            }
        }
        else if (curr_quote == quote) {
            curr_quote = -1
            continue
        }
    }
    return -1
}

export function find_next(src: string, target: string, ignore: string, start: number, end: number): number {
    for (let i = start; i < end; i++) {
        if (src[i] == target) {
            return i
        }
        else if (ignore.indexOf(src[i]) > -1) {
            continue
        }
        else {
            break
        }
    }
    return -1
}