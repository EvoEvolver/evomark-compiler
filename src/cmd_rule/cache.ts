import { evomark_core } from "../core"
import { exec_state, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { get_pure_literal } from "./common";


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (cmd_node.children[0]?.type != "cmd_body") {
        throw Error("bug")
    }
    if (assigned != null) {
        throw Error("bug")
    }
    if (cmd_node.children[0].children[0].type != "var_use") {
        throw Error("bug")
    }
    let host = state.get_obj_host(cmd_node.children[0].children[0])
    if (host.type != host_type.Lazy) {
        throw Error("bug")
    }
    // We compare whether two hash match
    let hash_node = cmd_node.children[1]
    if (!hash_node) {
        cmd_node.add_child(new parse_node("cmd_param")).set_content_obj(host.input_hash)
    }
    else {
        if (hash_node.type != "cmd_param") {
            throw Error("bug")
        }
        else if (hash_node.content_obj == null) {
            hash_node.content_obj = host.input_hash
        }
        else if (hash_node.content_obj != host.input_hash)
            return
    }

    let cache_content_node = cmd_node.children[2]
    if (cache_content_node) {
        if (cache_content_node.type != "cmd_body")
            throw Error("bug")
        let in_doc_cached_content = get_pure_literal(cache_content_node)
        if (in_doc_cached_content.trim() != "") {
            // This is a matching and non-empty cache body
            // We modify the cache table by it. This allow users to modify the cache

            // The potential problem is that the user might re-define in-doc cache
            // This will might the use of variable very non-functional
            // So we limit the number of in-doc cache for each variable to be one

            state.save_cache(host.input_hash, in_doc_cached_content)
            host.set_content(in_doc_cached_content)
        }
        else {
            // This is a empty body. We fill it for the users
            let cached_res = state.read_cache(host.input_hash)
            if (!cached_res)
                // We don't do anything if we also don't have the cache
                // Or the cache is an empty string
                return
            cache_content_node.children = []
            let cache_literal = cache_content_node.add_child(new parse_node("literal")).set_content(cached_res)
            cache_content_node.typesetting_type = "block"
            if (typeof cached_res === "string" && cached_res.indexOf("\n") < 0)
                cache_content_node.typesetting_type = "inline"
        }
        return
    }
}

export function cache(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("cache", simple_literal_parser))
    core.add_exec_rule("cache", exec)
}