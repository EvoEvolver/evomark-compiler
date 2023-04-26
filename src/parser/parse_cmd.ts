import { evomark_parser, parse_identifier, parse_node, parse_state } from "../parse"
import { get_parse_skeleton, parse_func_skeleton } from "../parser/parse_func"
import { find_next } from "./utils"

export function parse_cmd_var_name(src: string, state: parse_state): string {
    let start = state.pos
    if (src[start] != "%")
        return null
    state.pos++
    return parse_identifier(src, state)
}


export function parse_cmd_var(src: string, state: parse_state, parser: evomark_parser): boolean {
    let var_start = state.pos
    let var_name = parse_cmd_var_name(src, state)
    if (!var_name)
        return false
    let assign_start = state.pos
    let i = state.pos
    let equal_pos = find_next(src, "=", " ", assign_start, state.end)
    if (equal_pos > 0) {
        // Case 1: There is a equal sign: var_assign node
        state.pos = equal_pos + 1
        if (parse_cmd_var_assign(src, state, parser, var_name)) {
            state.curr_node.delim = [assign_start, state.pos]
            state.curr_node = state.curr_node.parent
        }
    }
    else {
        // Case 2: There is no equal sign: var_use node
        let node = state.push_node("var_use")
        node.content = var_name
        node.delim = [var_start, assign_start]
    }
    return true
}

export function parse_cmd_var_assign(src: string, state: parse_state, parser: evomark_parser, var_name: string): boolean {
    let start = state.pos
    let cmd_pos = find_next(src, "$", " \n", start, state.end)
    if (cmd_pos > -1) {
        state.pos = cmd_pos
        let var_node = state.push_node("var_assign")
        var_node.content = var_name
        state.curr_node = var_node
        let cmd_node = parse_cmd(src, state, parser)
        if (cmd_node !== null) {
            // We handle this in the exec phase
            //var_node.content_obj["result"] = cmd_node.content_obj["result"]
            //console.log(var_node.content_obj["result"])
            //state.cmd_exec_state.add_var(var_node)
        }
        if(src.slice(start, cmd_pos).indexOf("\n")<0)
            var_node.typesetting_type = "one_line"
        else
            var_node.typesetting_type = "two_line"
        state.curr_node = var_node
        return true
    }
    else {
        state.push_warning_node_to_root("\"@" + var_name + " = \" must be followed with a function")
        return false
    }
}


export const parse_cmd_skeleton = get_parse_skeleton("cmd", "$")

export function parse_cmd(src: string, state: parse_state, parser: evomark_parser): parse_node {
    if (src[state.pos] != "$")
        return null
    let succ = parse_cmd_skeleton(src, state, parser)
    if (!succ)
        return null
    let cmd_node = state.curr_node
    let rule = parser.cmd_rules[cmd_node.content]
    if(rule)
        rule.parse(src, state, parser)
    else
        state.push_warning_node_to_root("Cannot find rule for cmd "+cmd_node.content)
    state.pop_curr_node()
    return cmd_node
}