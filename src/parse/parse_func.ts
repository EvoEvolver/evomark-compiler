import {evomark_parser, parse_identifier, parse_node, parse_state, valid_identifier_name_char} from "./index"
import {find_next_char_repeat, find_next_pairing_ignore_quote} from "./utils"
import {parse_param} from "./parse_param";


export function parse_body(src: string, state: parse_state): parse_node {
    let start = state.pos
    // Trim white space
    while ("\n ".indexOf(src[start]) > -1)
        start++

    let delim_type = -1
    if (src[start] == "{") {
        delim_type = 0
    } else if (src[start] == "=") {
        delim_type = 0
        // Count number of =
        while (src[start] == "=") {
            start++
            delim_type++
        }
        if (src[start] != ">")
            return null
    } else {
        return null
    }
    start++
    // Trim white space
    while (src[start] == " ") {
        start++
    }
    // Check whether this is a multiple line body
    let contain_newline = false
    if (src[start] == "\n") {
        start++
        contain_newline = true
    }
    let end_delim_start = -1
    let end_delim_length = 1
    if (delim_type == 0) {
        end_delim_start = find_next_pairing_ignore_quote("{", "}", src, start)
    } else {
        let end_find_pos = start
        while (true) {
            let res = find_next_char_repeat(src, "=", delim_type, end_find_pos, src.length)
            if (!res) {
                return null
            }
            let [next_eq, n_repeat] = res
            if (src[next_eq + n_repeat] != "|") {
                end_find_pos = next_eq + n_repeat

            } else {
                end_delim_length = n_repeat + 1
                end_find_pos = next_eq
                break
            }
        }
        end_delim_start = end_find_pos
    }

    if (end_delim_start == -1)
        return null
    // Trim the spaces and last change line
    let body_end = end_delim_start - 1
    for (; body_end >= start; body_end--) {
        if (src[body_end] == " ")
            continue
        if (src[body_end] == "\n")
            break
        body_end++
        break
    }
    let node = state.push_node("body")
    node.delim = [start, body_end]
    if (delim_type == 0)
        node.typesetting_type = contain_newline ? "block" : "inline"
    else {
        node.typesetting_type = "code"
        node.meta["_delim"] = [delim_type, end_delim_length - 1]
    }
    state.pos = end_delim_start + end_delim_length
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
    rule(src, state, parser)
    state.curr_node = func_node.parent
    return true
}

export const parse_func_skeleton = get_parse_skeleton("func", "#")

export function get_parse_skeleton(env_type: string, starter: string) {
    function parse(src: string, state: parse_state, parser: evomark_parser): boolean {
        let start = state.pos
        if (start == state.end - 1) {
            return false
        }

        if (src[start] != starter) {
            return false
        }

        // We handle name starting from exclaim
        let num_exclaim = 0
        if(src[start + 1]=="!"){
            num_exclaim = 1
            state.pos++
        }
        // At most two ! are allowed
        if(src[start + 2]=="!") {
            num_exclaim = 2
            state.pos++
        }

        state.pos++

        if(!valid_identifier_name_char.test(src[state.pos])){
            return false
        }

        let func_name = parse_identifier(src, state)
        let func_node = state.push_node(env_type)
        func_node.content = func_name
        func_node.delim = [start]
        if(starter == "$")
            func_node.meta["exclaim"] = num_exclaim

        state.curr_node = func_node

        while (true) {
            let param_node = parse_param(src, state)
            if (param_node !== null)
                param_node.type = "param"
            let body_node = parse_body(src, state)
            if (body_node !== null)
                body_node.type = "body"
            if ((!param_node) && (!body_node)) {
                // Grammar sugar
                // Handle multi func like `#clk#box{}`
                // So that users don't write `#clk{#box{}}`
                if (src[state.pos] == starter) {
                    let all_param_node = true
                    for (let child of func_node.children) {
                        if (child.type != "param") {
                            all_param_node = false
                            break
                        }
                    }
                    if (!all_param_node)
                        break
                    // Try to parse following as func
                    let fake_body_node = new parse_node("body")
                    let func_start_pos = state.pos
                    state.curr_node = fake_body_node
                    if (parse(src, state, parser)) {
                        let real_body_node = new parse_node("body")
                        real_body_node.delim = [func_start_pos, state.pos]
                        //real_body_node.content = src.slice(func_start_pos, state.pos)
                        func_node.add_child(real_body_node)
                        // state.pos will remain in the state after parsing the fake_body_node
                        real_body_node.typesetting_type = "direct_child"
                    }
                    state.curr_node = func_node
                } else
                    break
            }
        }
        func_node.delim.push(state.pos)
        return true
    }

    return parse
}
