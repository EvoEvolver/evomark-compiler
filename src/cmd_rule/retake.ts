import { evomark_core } from "../core"
import { eval_without_cache, exec_state, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { make_set_node } from "./set";
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

    if (var_to_op.eval_func == null) {
        state.add_fatal("Variable without eval func cannot be retaken")
        return
    }

    let retake_res = eval_without_cache(var_to_op)
    let set_cmd_node = cmd_node.add_older_sibling(new parse_node("cmd"), true).set_content("set")
    make_set_node(set_cmd_node, var_to_op.var_name, var_to_op.input_hash, retake_res)
    var_to_op.set_content(retake_res)
}

export function retake(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("retake", simple_literal_parser))
    core.add_exec_rule("retake", exec)
}


