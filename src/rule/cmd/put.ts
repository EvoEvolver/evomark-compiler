import {evomark_core, proc_state} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec";
import {parse_node, parse_state} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_first_body_node, store_literal_to_host} from "../utils";


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host, core: evomark_core, proc_state: proc_state){
    let cmd_body = get_first_body_node(cmd_node)
    let [res,] = eval_to_text(cmd_body.children, state)
    //let [node, parse_state] = core.parser.parse(res, {})
    let p_state = new parse_state(res, proc_state.config)
    let [node, new_p_state] = core.parser.parse(res, p_state)
    node.type = "dynamic"
    cmd_node.add_sibling(node)
    return
}

export function put(core: evomark_core) {
    core.add_cmd_rule("put", simple_literal_parser)
    core.add_exec_rule("put", exec)
    core.add_cmd_rule("p", simple_literal_parser)
    core.add_exec_rule("p", exec)
}