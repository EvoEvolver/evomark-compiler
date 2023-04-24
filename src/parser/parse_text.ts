import { evomark_parser, parse_state } from "../parse"
import { parse_cmd, parse_cmd_var } from "./parse_cmd"

export function parse_text(src: string, state: parse_state, parser: evomark_parser): boolean {
    let start = state.pos

    let i = start
    let change_line_break = false

    for (; i < state.end; i++) {
        if ((/[#@$%]/).test(src[i])) {
            break
        }
        if ((/[\n]/).test(src[i])) {
            /*

            */
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
            if (trimed[trimed.length - 1] != "\n")
                trimed = trimed + " "
            if (content[0] == " ")
                trimed = " " + trimed
            node.content = trimed
        }
        state.pos = i
    }
    return succ
}

// Space insensitive literal
export function parse_literal(src: string, state: parse_state, parser: evomark_parser): boolean {
    let start = state.pos
    let i = start

    for (; i < state.end; i++) {
        if ((/[$%]/).test(src[i])) {
            break
        }
    }

    let succ = i != start
    if (succ) {
        let content = src.slice(start, i)
        if (content.length != 0) {
            //let trimed = content.replace(/^[ \n]+|[ \t]+$/g, '')
            let trimed = content.trim()
            let string_start = content.indexOf(trimed[0])
            let string_end = content.lastIndexOf(trimed[trimed.length-1])
            ///if (trimed[trimed.length - 1] != "\n")
            //    trimed = trimed + " "
            //if (content[0] == " ")
            //    trimed = " " + trimed
            if (trimed != "") {
                let node = state.push_node("literal")
                node.delim = [start+string_start, start+string_end+1]
                node.content = trimed
            }
        }
        state.pos = i
    }
    return succ

}

export function parse_literal_with_cmd(src: string, state: parse_state, parser: evomark_parser) {
    while (state.pos != state.end) {
        if (parse_literal(src, state, this))
            continue
        if (parse_cmd_var(src, state, this))
            continue
        if (parse_cmd(src, state, this))
            continue
        console.log("There is no available rules. Abort.")
        return false
    }
}

