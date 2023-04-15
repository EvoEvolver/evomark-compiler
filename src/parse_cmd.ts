import { evomark_parser, parse_identifier, parse_state } from "./parse"
import { parse_func_skeleton } from "./parse_func"
import { find_next } from "./utils/parse"

export function parse_cmd_var_name(src: string, state: parse_state): string {
    let start = state.pos
    if (src[start] != "%")
        return null
    state.pos++
    return parse_identifier(src, state)
}


export function parse_cmd_var(src: string, state: parse_state, parser: evomark_parser): boolean {
    let var_name = parse_cmd_var_name(src, state)
    if (!var_name)
        return false
    let start = state.pos
    let i = state.pos
    let equal_pos = find_next(src, "=", " ", start, state.end)
    if (equal_pos > 0) {
        // Case 1: There is a equal sign: var_assign node
        state.pos = equal_pos + 1
        if (parse_cmd_var_assign(src, state, parser, var_name)) {
            state.curr_node.delim = [start, state.pos]
            state.curr_node = state.curr_node.parent
        }
    }
    else {
        // Case 2: There is no equal sign: var_use node
        let node = state.push_node("var_use")
        node.content = var_name
    }
    return true
}

export function parse_cmd_var_assign(src: string, state: parse_state, parser: evomark_parser, var_name: string): boolean {
    let i = state.pos
    let cmd_pos = find_next(src, "$", " \n", i, state.end)
    if (cmd_pos > -1) {
        state.pos = cmd_pos
        let var_node = state.push_node("var_assign")
        var_node.content = var_name
        state.curr_node = var_node
        let succ = parse_cmd(src, state, parser)
        if (succ) {
            // TODO
        }
        state.curr_node = var_node
        return true
    }
    else {
        state.push_warning_node_to_root("\"@" + var_name + " = \" must be followed with a function")
        return false
    }
}

export function parse_cmd(src: string, state: parse_state, parser: evomark_parser): boolean {
    if (src[state.pos] != "$")
        return false
    parse_func_skeleton(src, state, parser, "$")
    return true
}