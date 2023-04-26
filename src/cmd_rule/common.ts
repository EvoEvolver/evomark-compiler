import { cmd_exec_state } from "../cmd_exec"
import { exec_state, host_type, obj_host } from "../exec/exec"
import { parse_node, parse_state, valid_identifier_name_char } from "../parse"


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
    return res.join("")
}

// The function modify assigned
export function store_literal_to_host(cmd_node: parse_node, state: exec_state, host: obj_host): void {
    let var_uses: obj_host[] = []
    let has_undef = false
    let cmd_body = cmd_node.children[0]
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
                if (content == null && var_host.type == host_type.Lazy) {
                    content = eval_and_cache(var_host, state.cache_table)
                }
                res.push(content + " ")
            }
            else
                res.push("<Error>")
            i_var ++
        }
        else if (node.type == "literal") {
            res.push(node.content + " ")
        }
        else if (node.type == "sep") {
            res.push("\n".repeat(node.content_obj))
        }
    }
    host.dependency = var_uses
    host.set_content(res.join(""))
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
    let res = host.eval(host.input)
    cache_table[host.input_hash] = res
    return res
}