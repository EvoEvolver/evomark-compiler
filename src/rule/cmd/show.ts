import {evomark_core} from "../../core"
import {exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {exec_var_op} from "./var_op";

function set_empty(cmd_node: parse_node, state: exec_state) {
    let var_use_node = cmd_node.push_child("body").set_typesetting_type("inline").push_child("var_use")
    var_use_node.set_content(state.last_var_assign.var_name)

}


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned != null) {
        state.add_fatal("There should not be an assigned variable")
        return
    }

    if (cmd_node.children.length == 0) {
        set_empty(cmd_node, state)
    }

    let res = exec_var_op(cmd_node, state)
    if (!res)
        return
    let [host, param, tail] = res
    let result_node = new parse_node("body")
    result_node.add_child(new parse_node("literal"))
        .set_content(host.get_content(state))
    cmd_node.set_child_at(result_node, tail)
}

export function show(core: evomark_core) {
    core.add_cmd_rule("show", simple_literal_parser)
    core.add_exec_rule("show", exec)
}