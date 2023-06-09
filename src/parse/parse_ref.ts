import {evomark_parser, parse_identifier, parse_state} from "./index";
import {parse_func} from "./parse_func";
import {find_next_char} from "./utils";


export function parse_ref(src: string, state: parse_state): string {
    let start = state.pos
    if (src[start] != "@")
        return null
    state.pos++
    return parse_identifier(src, state)
}


export function parse_ref_assign(src: string, state: parse_state, parser: evomark_parser): boolean {
    let ref_name = parse_ref(src, state)
    if (!ref_name)
        return false
    let start = state.pos
    let i = state.pos
    let equal_pos = find_next_char(src, "=", " ", start, state.end)
    let legal_def = false
    if (equal_pos > 0) {
        i = equal_pos + 1
        let func_pos = find_next_char(src, "#", " \n", i, state.end)
        state.pos = func_pos
        if (func_pos > -1) {
            let ref_node = state.push_node("ref")
            ref_node.content = ref_name
            state.curr_node = ref_node
            let succ = parse_func(src, state, parser)
            ref_node.delim = [start, state.pos]
            if (succ) {
                // Add the ref to the ref_table
                // We stop use ref_table
                // We need to postpone the reference resolution to the browser
                // TODO
                /*
                if (ref_name in state.ref_table) {
                    state.push_warning_node("Redefining " + ref_name + "!")
                } else {
                    state.ref_table[ref_name] = ref_node
                }
                */
                legal_def = true
            }
            state.curr_node = ref_node.parent
        }
    }
    if (!legal_def) {
        state.push_warning_node_to_root("\"@" + ref_name + " = \" must be followed with a function")
    }
    return true
}