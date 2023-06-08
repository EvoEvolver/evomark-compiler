import {parse_node, parse_state} from "./index";
import {find_next_pairing_ignore_quote} from "./utils";
import {parse} from "relaxed-json";

export function parse_param(src: string, state: parse_state): parse_node {
    let start = state.pos
    if (src[start] == "\n")
        start++
    if (src[start] != "(")
        return null
    let next = find_next_pairing_ignore_quote("(", ")", src, start + 1)
    if (next == -1)
        return null
    let param_src = src.slice(start + 1, next)
    let node = state.push_node("param")
    node.content = param_src

    // Judge the type of the input
    if (param_src.length == 0) {
        node.content_obj = null
    } else if ("\"\'".indexOf(param_src[0]) > -1 || param_src.indexOf(":") < 0) {
        node.content_obj = parse([param_src].join(""))
    } else {
        node.content_obj = parse(["{", param_src, "}"].join(""))
    }
    node.delim = [start, state.pos]
    state.pos = next + 1
    return node
}