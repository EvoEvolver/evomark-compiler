import { evomark_core } from "../core"
import { evomark_parser, parse_node, func_rule, parse_state, valid_identifier_name_char } from "../parse";



function parse(src: string, state: parse_state, parser: evomark_parser) {
    let param: string
    for (let node of state.curr_node.children) {
        if (node.type == "cmd_param") {
            param = node.content_obj
        }
        if (node.type == "cmd_body") {
            let literal_node = node.add_child(new parse_node("literal"))
            let content = src.slice(node.delim[0], node.delim[1]).trim()
            literal_node.content = content
            state.cmd_exec_state.add_cache(param, content)
            break
        }
    }
}

export function cache(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("cache", parse))
}