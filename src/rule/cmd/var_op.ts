import {exec_state, obj_host} from "../../exec/exec"
import {parse_node} from "../../parser"


function set_empty(cmd_node: parse_node, state: exec_state) {
    let var_use_node = cmd_node.push_child("body").set_typesetting_type("inline").push_child("var_use")
    var_use_node.set_content(state.last_var_assign.var_name)
}


export function exec_var_op(cmd_node: parse_node, state: exec_state): [obj_host, any, number] {
    let param = null
    let body_index = 0
    if (cmd_node.children[0]?.type == "param") {
        param = cmd_node.children[0].content_obj
        body_index = 1
    }

    if (cmd_node.children.length < body_index + 1) {
        set_empty(cmd_node, state)
    }
    let cmd_body = cmd_node.children[body_index]

    if (cmd_body.type != "body") {
        state.add_warning("There should be a body at position " + body_index)
        return
    }
    let first_child = cmd_body.get_first_sementic_child()
    if (first_child?.type != "var_use") {
        state.add_warning("Invalid input of the variable to save")
        return
    }
    let host_to_operate = state.node_to_obj_host(first_child)
    return [host_to_operate, param, body_index + 1]
}
