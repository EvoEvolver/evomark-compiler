// Pick a certain line in the input
// Example:
// $pick(1){%a}
import { evomark_core } from "../core"
import { exec_state, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { get_first_body_node, store_literal_to_host } from "./common";




function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let cmd_body = get_first_body_node(cmd_node)
    store_literal_to_host(cmd_body, state, assigned)
    if(assigned.status==host_type.Undef)
        return
    let content = assigned.get_content(state).trim()
    // TODO

}

export function def(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("def", simple_literal_parser))
    core.add_exec_rule("def", exec)
}