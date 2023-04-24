import { evomark_core } from "../core"
import { evomark_parser, parse_node, func_rule, parse_state, valid_identifier_name_char } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { resolve_text } from "./common";



function parse(src: string, state: parse_state, parser: evomark_parser) {
    for (let node of state.curr_node.children) {
        if (node.type == "cmd_body") {
            let literal_node = node.add_child(new parse_node("literal"))
            let content = src.slice(node.delim[0], node.delim[1]).trim()
            literal_node.content = content
            let resolved = resolve_text(content, state)
            // Assign the rendered content to cmd node
            state.curr_node.content_obj["result"] = resolved
            break
        }
    }
}

export function def(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("def", simple_literal_parser))
}