import { evomark_core } from "../core"
import { exec_state, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { get_first_body_node, store_literal_to_host } from "./common";

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

    let host = new obj_host()
    let cmd_body = get_first_body_node(cmd_node)
    store_literal_to_host(cmd_body, state, host)

    

}

export function save(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("save", simple_literal_parser))
    core.add_exec_rule("save", exec)
}