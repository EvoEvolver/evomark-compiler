import {evomark_core} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, store_literal_to_host} from "../utils";


async function exec(cmd_node: parse_node, state: exec_state): Promise<obj_host> {
    let cmd_body = get_first_body_node(cmd_node)
    let {text} = await eval_to_text(cmd_body.children, state)
    let host = new obj_host()
    host.set_content(text)
    return host
}

export function def(core: evomark_core) {
    core.add_cmd_rule("def", simple_literal_parser)
    core.add_exec_rule("def", exec)
    core.add_cmd_rule("d", simple_literal_parser)
    core.add_exec_rule("d", exec)
}