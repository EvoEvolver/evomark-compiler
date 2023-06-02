import {evomark_core} from "../../core"
import {exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, store_literal_to_host} from "../utils";


async function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let cmd_body = get_first_body_node(cmd_node)
    let host = state.name_to_obj_host(assigned.var_name)
    if (host == null)
        await store_literal_to_host(cmd_body, state, assigned)
    else {
        assigned.set_content(await host.get_content(state))
    }
}

export function init(core: evomark_core) {
    core.add_cmd_rule("init", simple_literal_parser)
    core.add_exec_rule("init", exec)
}