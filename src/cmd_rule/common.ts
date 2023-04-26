import { exec_state, get_hash, host_type, obj_host } from "../exec/exec"
import { parse_node } from "../parse"
import { normalize_text } from "../utils/normalize"


export function get_pure_literal(cmd_body: parse_node): string {
    let res: string[] = []
    for (let node of cmd_body.children) {
        if (node.type == "literal") {
            res.push(node.content + " ")
        }
        else if (node.type == "sep") {
            res.push("\n".repeat(node.content_obj))
        }
        else {
            throw Error("illegle")
        }
    }
    return normalize_text(res.join(""))
}

export function get_first_body_node(cmd_node: parse_node) {
    for (let child of cmd_node.children) {
        if (child.type.endsWith("_body"))
            return child
    }
    return null
}

// The function modify assigned
export function store_literal_to_host(cmd_body: parse_node, state: exec_state, host: obj_host): void {
    if (cmd_body == null)
        throw Error("A body is needed")
    let var_uses: obj_host[] = []
    let has_undef = false
    for (let node of cmd_body.children) {
        if (node.type == "var_use") {
            let var_host = state.get_obj_host(node)
            if (var_host != null)
                var_uses.push(var_host)
            else {
                has_undef = true
                var_uses.push(null)
            }
            if (var_host.type == host_type.Undef) {
                has_undef = true
            }
        }
    }
    let res: string[] = []
    let i_var = 0
    for (let node of cmd_body.children) {
        if (node.type == "var_use") {
            let var_host = var_uses[i_var]
            if (var_host != null) {
                let content = var_host.content()
                if (content == "*Undef*" && var_host.type == host_type.Lazy) {
                    content = eval_and_cache(var_host, state.cache_table)
                }
                res.push(content + " ")
            }
            else
                res.push("*Error*")
            i_var++
        }
        else if (node.type == "literal") {
            res.push(node.content + " ")
        }
        else if (node.type == "sep") {
            res.push("\n".repeat(node.content_obj))
        }
    }
    host.dependency = var_uses
    host.set_content(normalize_text(res.join("")))
    if (has_undef) {
        host.type = host_type.Undef
    }
    else {
        host.type = host_type.InDoc
    }
}


export function eval_and_cache(host: obj_host, cache_table: any): any {
    let cached = cache_table[host.input_hash]
    if (cached != undefined)
        return cached
    let res = host.eval_func(host.input)
    cache_table[host.input_hash] = res
    host.set_content(res)
    return res
}


export function set_lazy_variable(state: exec_state, input_cmd_body: parse_node, assigned: obj_host, caller_name: string, eval_func: (input: any) => any) {
    let host = new obj_host()
    store_literal_to_host(input_cmd_body, state, host)
    if (host.type == host_type.Undef) {
        assigned.type = host_type.Undef
        return
    }
    let input = host.content()
    let input_hash = get_hash(input, caller_name)
    let cache_in_table = state.read_cache(input_hash)
    assigned.dependency = host.dependency
    assigned.input_hash = input_hash
    assigned.type = host_type.Lazy
    if (cache_in_table) {
        assigned.set_content(cache_in_table)
    }
    else {
        assigned.input = input
        assigned.eval_func = eval_func
    }
}