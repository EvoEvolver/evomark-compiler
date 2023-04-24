import { evomark_core } from "../core"
import { evomark_parser, parse_node, func_rule, parse_state, valid_identifier_name_char } from "../parse";
import { insert_cache, resolve_text } from "./common";
import { hash } from "spark-md5"


function parse(src: string, state: parse_state, parser: evomark_parser) {
    for (let node of state.curr_node.children) {
        if (node.type == "cmd_body") {
            let literal_node = node.add_child(new parse_node("literal"))
            let content = src.slice(node.delim[0], node.delim[1]).trim()
            literal_node.content = content
            let input = resolve_text(content, state)
            let input_hash = hash(input)
            let result = state.cmd_exec_state.read_cache(input_hash)
            if(!result){
                result = "hello "+input
                insert_cache(state.curr_node, input_hash, result)
            }
            break
        }
    }
}

export function hello(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("hello", parse))
}