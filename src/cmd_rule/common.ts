import { cmd_exec_state } from "../cmd_exec"
import { parse_node, parse_state, valid_identifier_name_char } from "../parse"

function get_var_pos(src: string, state: parse_state) {
    let var_name_start = -1
    let var_pos = []
    for (let i = 0; i <= src.length; i++) {
        if (src[i] == "%") {
            var_name_start = i
        }
        else if (!valid_identifier_name_char.test(src[i]) || i == src.length) {
            if (var_name_start > -1) {
                if (i - var_name_start <= 1) {
                    state.push_warning_node_to_root("% must be followed by a var name")
                }
                else {
                    var_pos.push([var_name_start, i])
                }
                var_name_start = -1
            }
        }
    }
    return var_pos
}

function get_var_identifiers(src: string, var_pos: number[][]) {
    let ids = []
    for (let pos of var_pos) {
        ids.push(src.slice(pos[0] + 1, pos[1]))
    }
    return ids
}

function resolve_content_by_id(id: string, state: cmd_exec_state) {
    let res = state.get_content_by_id(id)
    if (res !== null)
        return res
    return "[Unknown %" + id + "]"
}


export function resolve_text(content, state: parse_state): string {
    
    let var_pos = get_var_pos(content, state)
    let ids = get_var_identifiers(content, var_pos)
    let resolved = []
    for (let id of ids) {
        resolved.push(resolve_content_by_id(id, state.cmd_exec_state))
    }
    let begin = 0
    let res = []
    for (let i = 0; i < var_pos.length; i++) {
        res.push(content.slice(begin, var_pos[i][0]))
        begin = var_pos[i][1]
        res.push(resolved[i])
    }
    res.push(content.slice(begin))
    let rendered = res.join("")
    

    return rendered
}

export function insert_cache(curr_node: parse_node, input_hash: string, result: string){
    while(true){
        let parent = curr_node.parent
        if(["root", "func_body"].indexOf(parent.type)>-1){
            let cache_node = new parse_node("cmd")
            cache_node.content = "cache"
            cache_node.parent = parent
            let param_node = cache_node.push_child("cmd_param")
            let body_node = cache_node.push_child("cmd_body")
            param_node.content_obj = input_hash
            body_node.content = result
            let literal = body_node.push_child("hidden_literal")
            literal.content = result
            parent.children.splice(parent.children.length-1, 0 ,cache_node)
            return cache_node
        }
    }
}