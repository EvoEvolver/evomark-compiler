import {evomark_core} from "../../core"
import {exec_state, obj_host} from "../../exec"
import {parse_node} from "../../parse"
import {simple_literal_parser} from "../../parse/common"
import {exec_var_op} from "./var_op"


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    let res = exec_var_op(cmd_node, state)
    if (!res)
        return
    let [var_to_op, param, tail] = res

    //TODO


}

export function append(core: evomark_core) {
    core.add_cmd_rule("append", simple_literal_parser)
    core.add_exec_rule("append", exec)
}


