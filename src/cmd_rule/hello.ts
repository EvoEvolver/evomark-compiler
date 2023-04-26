import { evomark_core } from "../core"
import { exec_state, get_hash, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { store_literal_to_host } from "./common";


// Let's imagine this is a very heavy task
function query_hello(input: string): string {
    return "Hello! " + input
}

function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let host = new obj_host()
    store_literal_to_host(cmd_node, state, host)
    if (host.type == host_type.Undef) {
        assigned.type = host_type.Undef
        return
    }
    let input = host.content()
    let input_hash = get_hash(input, "hello")
    let sibling = cmd_node.parent.get_next_non_sep_sibling()
    let cache_in_table = state.read_cache(input_hash)
    assigned.dependency = host.dependency
    assigned.input_hash = input_hash
    assigned.type = host_type.Lazy
    if(cache_in_table){
        assigned.set_content(cache_in_table)
    }
    else{
        assigned.input = input
        assigned.eval = query_hello
    }
}

export function hello(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("hello", simple_literal_parser))
    core.add_exec_rule("hello", exec)
}