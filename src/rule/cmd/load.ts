import {evomark_core} from "../../core"
import {eval_to_text, exec_state, get_hash, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_param_body_pairs} from "../utils";


async function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null) {
        state.add_fatal("There should be an assigned variable")
        return
    }
    let param_body_pairs = get_param_body_pairs(cmd_node)
    if (param_body_pairs.length < 1) {
        state.add_fatal("$load needs at 1 bodies")
        return
    }
    let i = 0
    let key: string
    for (let [param, body] of param_body_pairs) {
        let {text, dependency} = await eval_to_text(body.children, state)
        if (i == 0) {
            key = text
        }
        if (i == 1)
            break
        i++
    }
    let value = state.read_cache(get_hash(key, "save"))
    assigned.set_content(value)
}

export function load(core: evomark_core) {
    core.add_cmd_rule("load", simple_literal_parser)
    core.add_exec_rule("load", exec)
}