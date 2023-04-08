import { parse_node, parse_state } from "./parse"
import { find_next_pairing_ignore_quote } from "./utils/parse"
import { parse } from "relaxed-json"


export var valid_func_name_char = /[a-zA-Z0-9]/

export function parse_func_param(src: string, state: parse_state): any {
    let start = state.pos
    if (src[start] == "\n")
        start ++
    if (src[start] != "(")
        return false
    let next = find_next_pairing_ignore_quote("(", ")", src, start + 1)
    if (next == -1)
        return false
    let param_src = src.slice(start + 1, next)
    let node = state.push_node("func_param")
    node.content = param_src

    // Judge the type of the input
    if(param_src.length==0){
        node.content_obj = null
    }
    else if("\"\'".indexOf(param_src[0])>-1 || param_src.indexOf(":")<0){
        node.content_obj = parse([param_src].join(""))
    }
    else{
        node.content_obj = parse(["{",param_src,"}"].join(""))
    }

    state.pos = next + 1
    return node.content_obj
}

export function parse_func_body(src: string, state: parse_state): parse_node {
    let start = state.pos
    if (src[start] == "\n")
        start ++
    if (src[start] != "{")
        return null
    let next = find_next_pairing_ignore_quote("{", "}", src, start + 1)
    if (next == -1)
        return null
    let param_src = src.slice(start + 1, next)
    let node = state.push_node("func_body")
    node.delim = [start + 1, next]
    node.content = param_src
    state.pos = next + 1
    return node
}

export function parse_func_name(src: string, state: parse_state): string {
    let start = state.pos
    let i = start
    for (; i < state.end; i++) {
        if (!valid_func_name_char.test(src[i])) {
            break
        }
    }
    let func_name = src.slice(start, i)
    state.pos = i
    return func_name
}