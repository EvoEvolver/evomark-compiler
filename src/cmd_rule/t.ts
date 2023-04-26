import { evomark_core } from "../core"
import { exec_state, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { store_literal_to_host } from "./common";




function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    store_literal_to_host(cmd_node, state, assigned)
}

export function t(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("t", simple_literal_parser))
    core.add_exec_rule("t", exec)
}