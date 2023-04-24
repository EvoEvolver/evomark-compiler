import { evomark_parser, func_parser, parse_node, parse_state } from "../parse"
import { parse_literal, parse_literal_with_cmd } from "./parse_text"


type body_wise_parse = (src: string, state: parse_state, param: any, parser: evomark_parser) => void

export function from_body_wise_parse(body_wise_parse: body_wise_parse): func_parser {
    function parse(src: string, state: parse_state, parser: evomark_parser) {
        let param: any = null
        for (let node of state.curr_node.children) {
            if (node.type.endsWith("_param")) {
                param = node.content_obj
            }
            if (node.type.endsWith("_body")) {
                let [body_start, body_end] = node.delim
                let saved = state.set_local_state(body_start, body_start, body_end, node)
                body_wise_parse(src, state, param, parser)
                state.restore_state(saved)
                param = null
            }
        }
    }
    return parse
}

export function simple_parser(src: string, state: parse_state, parser: evomark_parser) {
    for (let node of state.curr_node.children) {
        if (node.type.endsWith("_body")) {
            let [body_start, body_end] = node.delim
            let saved = state.set_local_state(body_start, body_start, body_end, node)
            parser.parse_core(src, state)
            state.restore_state(saved)
        }
    }
}

export function simple_literal_parser(src: string, state: parse_state, parser: evomark_parser) {
    for (let node of state.curr_node.children) {
        if (node.type.endsWith("_body")) {
            //let literal_node = node.add_child(new parse_node("literal"))
            //literal_node.content = src.slice(node.delim[0], node.delim[1]).trim()
            let [body_start, body_end] = node.delim
            let saved = state.set_local_state(body_start, body_start, body_end, node)
            parse_literal_with_cmd(src, state, parser)
            state.restore_state(saved)
        }
    }
}