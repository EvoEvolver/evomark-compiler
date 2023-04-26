import { evomark_core } from "../core"
import { exec_state, obj_host } from "../exec/exec";
import { parse_node, func_rule, parse_state, valid_identifier_name_char } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { store_literal_to_host } from "./common";




function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned != null)
        throw Error("illegal")
    let host = new obj_host()
    store_literal_to_host(cmd_node, state, host)

    let sibling = cmd_node.get_next_non_sep_sibling()

    if (sibling != null && sibling.type == "cmd" && sibling.content == "t") {
        sibling.children[0].children = []
        sibling.children[0].add_child(new parse_node("literal").set_content(host.content()))
        return
    }

    cmd_node.add_sibling(new parse_node("cmd")).set_content("t")
        .add_child(new parse_node("cmd_body"))
        .add_child(new parse_node("literal"))
        .set_content(host.content())

    cmd_node.add_sibling(new parse_node("sep").set_content_obj(1))

}

export function show(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("show", simple_literal_parser))
    core.add_exec_rule("show", exec)
}