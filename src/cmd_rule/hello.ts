import { evomark_core } from "../core"
import { exec_state, get_hash, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { get_first_body_node, set_lazy_variable, store_literal_to_host } from "./common";


// Let's imagine this is a very heavy task
function query_hello(input: string): string {
    return "Hello! " + input
}

function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let cmd_body = get_first_body_node(cmd_node)
    set_lazy_variable(state, cmd_body, assigned, "hello", query_hello)
}

export function hello(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("hello", simple_literal_parser))
    core.add_exec_rule("hello", exec)
}