import { evomark_parser, parse_identifier, parse_node, func_rule, parse_state, valid_identifier_name_char } from "../parse"
import { find_next_pairing_ignore_quote } from "./utils"
import { parse } from "relaxed-json"


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
    }
    else if ("\"\'".indexOf(param_src[0]) > -1 || param_src.indexOf(":") < 0) {
        node.content_obj = parse([param_src].join(""))
    }
    else {
        node.content_obj = parse(["{", param_src, "}"].join(""))
    }
    node.delim = [start, state.pos]
    state.pos = next + 1
    return node
}

export function parse_body(src: string, state: parse_state): parse_node {
    let start = state.pos
    // Trim white space
    while("\n ".indexOf(src[start]) > -1)
        start++
    if (src[start] != "{")
        return null
    start ++
    // Trim white space
    while(src[start] == " "){
        start ++
    }
    // Check whether this is a multiple line body
    let contain_newline = false
    if(src[start] == "\n"){
        start ++
        contain_newline = true
    }
    let next = find_next_pairing_ignore_quote("{", "}", src, start)
    if (next == -1)
        return null
    let node = state.push_node("body")
    node.delim = [start, next]
    node.typesetting_type = contain_newline ? "block" : "inline"
    state.pos = next + 1
    return node
}

export function parse_func(src: string, state: parse_state, parser: evomark_parser): boolean {
    let succ = parse_func_skeleton(src, state, parser)
    if (!succ)
        return false

    let func_node = state.curr_node
    let func_name = func_node.content
    let rule = parser.func_rules[func_name]
    if (!rule) {
        console.log("Cannot find rule name " + func_name)
        rule = parser.func_rules["box"]
    }
    rule.parse(src, state, parser)
    state.curr_node = func_node.parent
    return true
}

export const parse_func_skeleton = get_parse_skeleton("func", "#")

export function get_parse_skeleton(env_type: string, starter: string) {
    const param_node_type = env_type + "_param" // func_body or func_param
    const body_node_type = env_type + "_body" // func_body or cmd_body
    function parse(src: string, state: parse_state, parser: evomark_parser): boolean {
        let start = state.pos
        if (start == state.end - 1) {
            return false
        }

        if (src[start] != starter || !valid_identifier_name_char.test(src[start + 1])) {
            return false
        }

        state.pos++
        let func_name = parse_identifier(src, state)
        let func_node = state.push_node(env_type)
        func_node.meta["id_delim"] = [start, state.pos]
        func_node.content = func_name
        state.curr_node = func_node
        func_node.delim = [start]

        while (true) {
            let param_node = parse_param(src, state)
            if (param_node !== null)
                param_node.type = param_node_type
            let body_node = parse_body(src, state)
            if (body_node !== null)
                body_node.type = body_node_type
            if ((!param_node) && (!body_node)) {
                // Grammar sugar
                // Handle multi func like `#clk#box{}`
                // So that users don't write `#clk{#box{}}`
                if (src[state.pos] == starter) {
                    let all_param_node = true
                    for (let child of func_node.children) {
                        if (child.type != param_node_type) {
                            all_param_node = false
                            break
                        }
                    }
                    if (!all_param_node)
                        break
                    // Try to parse following as func
                    let fake_body_node = new parse_node(body_node_type)
                    let func_start_pos = state.pos
                    state.curr_node = fake_body_node
                    if (parse(src, state, parser)) {
                        let real_body_node = new parse_node(body_node_type)
                        real_body_node.delim = [func_start_pos, state.pos]
                        //real_body_node.content = src.slice(func_start_pos, state.pos)
                        func_node.add_child(real_body_node)
                        // state.pos will remain in the state after parsing the fake_body_node
                        real_body_node.typesetting_type = "direct_child"
                    }
                    state.curr_node = func_node
                }
                else
                    break
            }
        }
        func_node.delim.push(state.pos)
        return true
    }
    return parse
}


//export class body_node extends parse_node{
    
//}