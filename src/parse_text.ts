import { evomark_parser, parse_state } from "./parse"

export function parse_text(src: string, state: parse_state, parser: evomark_parser): boolean {
    let start = state.pos

    let i = start
    let change_line_break = false

    for (; i < state.end; i++) {
        if ((/[#@$%]/).test(src[i])) {
            break
        }
        if ((/[\n]/).test(src[i])) {
            if (i + 1 < state.end && (/[\n]/).test(src[i + 1])) {
                change_line_break = true
                break
            }
        }
    }
    
    let succ = i != start
    if (succ) {
        let content = src.slice(start, i)
        if (content.length != 0) {
            let node = state.push_node("text")
            node.delim = [start, i]
            let trimed = content.replace(/^[ \t]+|[ \t]+$/g, '')
            if(trimed[trimed.length-1]!="\n")
                trimed = trimed+" "
            if(content[0]==" ")
                trimed = " "+trimed
            node.content = trimed
        }
        state.pos = i
    }
    return succ
}