import { evomark_parser, parse_state } from "../parse"
import { normalize_text } from "../utils/normalize"
import { parse_cmd, parse_cmd_var } from "./parse_cmd"

function parse_newline(src: string, state: parse_state) {

}

const cmd_breaking = /[$%]/

export function parse_cmd_breaking_literal(src: string, state: parse_state, parser: evomark_parser): boolean {
    return parse_literal(src, state, parser, cmd_breaking)
}

const normal_breaking = /[$%#@]/

export function parse_normal_breaking_literal(src: string, state: parse_state, parser: evomark_parser): boolean {
    return parse_literal(src, state, parser, normal_breaking)
}

// Space insensitive literal
export function parse_literal(src: string, state: parse_state, parser: evomark_parser, breaker: RegExp): boolean {
    let start = state.pos

    let i = start
    let n_new_line_before = 0
    let n_new_line_after = 0
    let before_non_empty = true
    for (; i < state.end; i++) {
        if (breaker.test(src[i])) {
            break
        }
        if ((/[\n]/).test(src[i])) {
            if (before_non_empty)
                n_new_line_before++
            else
                n_new_line_after++
            continue
        }
        if (src[i] == " ")
            continue
        // This part is reached only when a non blank character is found
        n_new_line_after = 0 // Reset the count
        before_non_empty = false
    }

    let succ = i != start
    if (!succ)
        return false

    if (n_new_line_before > 2)
        n_new_line_before = 2
    if (n_new_line_after > 2)
        n_new_line_after = 2

    let content = src.slice(start, i)
    state.pos = i
    if (content.length == 0)
        throw Error("bug found")

    let normalized = normalize_text(content)
    if (normalized.length == 0 && n_new_line_after == 0 && n_new_line_before == 0)
        return true
    if (normalized.length == 0 && n_new_line_before == 1)
        n_new_line_before = 1
    if (n_new_line_before != 0) {
        let sep_node = state.push_node("sep")
        sep_node.content_obj = n_new_line_before
    }
    if (normalized.length != 0) {
        let node = state.push_node("literal")
        node.delim = [start, i]
        node.content = normalized
    }
    if (i == state.end) {
        if (n_new_line_after == 1)
            n_new_line_after = 0
    }

    if (n_new_line_after != 0) {
        let sep_node = state.push_node("sep")
        sep_node.content_obj = n_new_line_after
    }

    return true

}

export function parse_literal_with_cmd(src: string, state: parse_state, parser: evomark_parser) {
    while (state.pos != state.end) {
        if (parse_cmd_breaking_literal(src, state, parser))
            continue
        if (parse_cmd_var(src, state, parser))
            continue
        if (parse_cmd(src, state, parser))
            continue
        if (state.pos < state.end) {
            console.log("There is no available rules. Abort.")
            return true
        } else
            return false
    }
}

