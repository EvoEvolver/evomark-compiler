import {evomark_core} from "../../core"
import {exec_state, obj_host} from "../../exec/exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, set_lazy_variable} from "../utils";


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
    core.add_cmd_rule("hello", simple_literal_parser)
    core.add_exec_rule("hello", exec)
}