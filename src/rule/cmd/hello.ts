import {evomark_core} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, set_cached_obj_with_eval, set_lazy_variable} from "../utils";


// Let's imagine this is a very heavy task
async function query_hello(input: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return "Hello! " + input
}

async function exec(cmd_node: parse_node, state: exec_state) {
    let cmd_body = get_first_body_node(cmd_node)
    let {text} = await eval_to_text(cmd_body.children, state)
    let assigned = new obj_host()
    set_cached_obj_with_eval(state, text, assigned, "hello", query_hello)
    return assigned
}

export function hello(core: evomark_core) {
    core.add_cmd_rule("hello", simple_literal_parser)
    core.add_exec_rule("hello", exec)
}