import { evomark_core } from "../core"
import { exec_state, get_hash, host_type, obj_host } from "../exec/exec"
import { parse_node, func_rule } from "../parse"
import { simple_literal_parser } from "../parser/common"
import { exec_var_op } from "./var_op"


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    let res = exec_var_op(cmd_node, state)
    if (!res)
        return
    let [var_to_op, param, tail] = res

    //TODO
    

}

export function append(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("append", simple_literal_parser))
    core.add_exec_rule("append", exec)
}


