// Pick a certain line in the input
// Example:
// $pick(1){%a}
import {evomark_core} from "../../core"
import {exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, store_literal_to_host} from "../utils";


async function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let cmd_body = get_first_body_node(cmd_node)
    await store_literal_to_host(cmd_body, state, assigned)
    if (!assigned.defined)
        return
    let content = (await assigned.get_text(state)).trim()
    // TODO

}

export function def(core: evomark_core) {
    core.add_cmd_rule("def", simple_literal_parser)
    core.add_exec_rule("def", exec)
}