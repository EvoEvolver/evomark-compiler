import {eval_to_text, exec_state, get_hash, obj_host} from "../../exec"
import {parse_node} from "../../parse"

export function get_first_body_node(cmd_node: parse_node) {
    for (let child of cmd_node.children) {
        if (child.type == "body")
            return child
    }
    return null
}

export function get_param_body_pairs(parent: parse_node): [parse_node, parse_node][] {
    let res = []
    let last_param: parse_node = null
    for (let child of parent.children) {
        if (child.type == "body") {
            res.push([last_param, child])
            last_param = null
        } else if (child.type == "param") {
            last_param = child
        }
    }
    return res
}


// The function modify assigned
export async function store_literal_to_host(cmd_body: parse_node, state: exec_state, host: obj_host): Promise<void> {
    if (cmd_body == null)
        throw Error("A body is needed")
    let {text, dependency} = await eval_to_text(cmd_body.children, state)
    host.dependency = dependency
    host.set_content(text)
}

export function set_cached_obj_with_eval(state: exec_state, input: any, assigned: obj_host, caller_name: string, eval_func: (input: any) => any) {
    let input_hash = get_hash(input, caller_name)
    let cache_in_table = state.read_cache(input_hash)
    assigned.input_hash = input_hash
    assigned.use_cache = true
    assigned.input = input
    assigned.eval_func = eval_func
    if (cache_in_table) {
        assigned.set_content(cache_in_table)
    }
}


export async function set_lazy_variable(state: exec_state, input_cmd_body: parse_node, assigned: obj_host, caller_name: string, eval_func: (input: any) => any) {
    let host = new obj_host()
    await store_literal_to_host(input_cmd_body, state, host)
    if (!host.defined) {
        assigned.defined = false
        return
    }
    let input = host.get_content(state)
    let input_hash = get_hash(input, caller_name)
    let cache_in_table = state.read_cache(input_hash)
    assigned.dependency = host.dependency
    assigned.input_hash = input_hash
    assigned.use_cache = true
    assigned.input = input
    assigned.eval_func = eval_func
    if (cache_in_table) {
        assigned.set_content(cache_in_table)
    }
}