import {evomark_core} from "../../core"
import {exec_state, get_hash, obj_host} from "../../exec/exec"
import {func_rule, parse_node} from "../../parser"
import {simple_literal_parser} from "../../parser/common"
import {exec_var_op} from "./var_op"


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    let res = exec_var_op(cmd_node, state)
    if (!res)
        return
    let [var_to_op, param, tail] = res
    let buffered_hash = null
    let buffered_cache_node = cmd_node.children[tail]

    if (buffered_cache_node === undefined) {
        buffered_cache_node = cmd_node.set_child_at(new parse_node("param"), tail)
    } else if (buffered_cache_node.type != "param") {
        state.add_warning("The param node must be param")
        return
    } else {
        buffered_hash = buffered_cache_node.content_obj
    }
    if (assigned != null) {
        if (buffered_hash != null) {
            let buffered_content = state.read_cache(buffered_hash)
            assigned.set_content(buffered_content)
        }
    }


    let new_hash = get_hash(var_to_op.get_text(state), "buffer")
    let newly_buffered_content = var_to_op.get_content(state)
    state.save_cache(new_hash, newly_buffered_content)
    buffered_cache_node.set_content_obj(new_hash)

}

export function buffer(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("buffer", simple_literal_parser))
    core.add_exec_rule("buffer", exec)
}


