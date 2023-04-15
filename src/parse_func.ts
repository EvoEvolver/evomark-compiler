import { evomark_parser, parse_identifier, parse_node, parse_rule_func, parse_state, valid_identifier_name_char } from "./parse"
import { find_next_pairing_ignore_quote } from "./utils/parse"
import { parse } from "relaxed-json"




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
    node.delim = [start, state.pos]
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
    node.delim = [start+1, next]
    node.content = param_src
    state.pos = next + 1
    return node
}
export function parse_func(src: string, state: parse_state, parser: evomark_parser): boolean {
    let succ = parse_func_skeleton(src, state, parser)
    if(!succ)
        return false

    let func_node = state.curr_node
    let func_name = func_node.content
    let rule = parser.parse_rules_func[func_name]
    if (!rule) {
        console.log("Cannot find rule name " + func_name)
        rule = parser.parse_rules_func["box"]
    }
    rule.parse(src, state, parser)
    state.curr_node = func_node.parent
    return true
}

export function parse_func_skeleton(src: string, state: parse_state, parser: evomark_parser): boolean {
    let start = state.pos

    if (start == state.end - 1) {
        return false
    }

    if (src[start] != "#" || !valid_identifier_name_char.test(src[start + 1])) {
        return false
    }

    state.pos++
    let func_name = parse_identifier(src, state)
    let func_node = state.push_node("func")
    func_node.meta["id_delim"] = [start, state.pos]
    func_node.content = func_name
    state.curr_node = func_node
    func_node.delim = [start]

    while (true) {
        let param = parse_func_param(src, state)
        if(param === false)
            param = null
        let body_node = parse_func_body(src, state)

        if ((!param) && (!body_node)) {
            // Grammar sugar
            // Handle multi func like `#clk#box{}`
            // So that users don't write `#clk{#box{}}`
            if (src[state.pos] == "#") {
                let all_param_node = true
                for (let child of func_node.children) {
                    if (child.type != "func_param") {
                        all_param_node = false
                        break
                    }
                }
                if (!all_param_node)
                    break
                // Try to parse following as func
                let fake_body_node = new parse_node("func_body")
                let func_start_pos = state.pos
                state.curr_node = fake_body_node
                if (parse_func_skeleton(src, state, parser)) {
                    let real_body_node = new parse_node("func_body")
                    real_body_node.delim = [func_start_pos, state.pos]
                    real_body_node.content = src.slice(func_start_pos, state.pos)
                    func_node.add_child(real_body_node)
                    // state.pos will remain in the state after parsing the fake_body_node
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