import {evomark_core} from "../../core"
import {eval_to_text, exec_state, get_hash, obj_host} from "../../exec/exec";
import { parse_node} from "../../parser";
import {simple_literal_parser} from "../../parser/common";
import {get_param_body_pairs} from "../utils";


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned != null) {
        state.add_fatal("There should not be an assigned variable")
        return
    }
    let param_body_pairs = get_param_body_pairs(cmd_node)
    if (param_body_pairs.length < 2) {
        state.add_fatal("$save needs at 2 bodies")
        return
    }
    let i = 0
    let key: string
    let value: string
    for (let [param, body] of param_body_pairs) {
        let [text, dependency] = eval_to_text(body.children, state)
        if (i == 0) {
            key = text
        }
        if (i == 1) {
            value = text
        }
        if (i > 1)
            break
        i++
    }
    state.save_cache(get_hash(key, "save"), value)
}

export function save(core: evomark_core) {
    core.parser.add_cmd_rule("save", simple_literal_parser)
    core.add_exec_rule("save", exec)
}


