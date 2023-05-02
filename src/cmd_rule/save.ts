import { evomark_core } from "../core"
import { exec_state, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { exec_var_op } from "./var_op";


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned != null) {
        state.add_fatal("There should not be an assigned variable")
        return
    }
    let res = exec_var_op(cmd_node, state)
    if (!res)
        return
    let [var_to_op, param, _] = res
    state.save_var(var_to_op)
}

export function save(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("save", simple_literal_parser))
    core.add_exec_rule("save", exec)
}


