import { evomark_core } from "../core"
import { eval_and_cache, exec_state, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { store_literal_to_host } from "./common";

const inline_length_limit = 100

export function make_set_node(cmd_node: parse_node, var_name: string, input_hash: string, content: any) {
    cmd_node.children = []
    // Set variable
    let var_use_node = cmd_node.push_child("body").set_typesetting_type("inline").push_child("var_use")
    var_use_node.set_content(var_name)

    // Set hash
    let hash_node = cmd_node.push_child("param")
    hash_node.set_content_obj(input_hash)

    // Set cache content
    let cache_content_node = cmd_node.push_child("body")
    cache_content_node.children = []
    cache_content_node.push_child("literal").set_content(content)

    // If it is just one line and short, make the type setting inline
    cache_content_node.typesetting_type = "block"
    if (typeof content === "string" && content.indexOf("\n") < 0 && content.length < inline_length_limit)
        cache_content_node.typesetting_type = "inline"
}

function set_empty(cmd_node: parse_node, state: exec_state) {
    if (state.last_var_assign == null) {
        state.add_warning("There is no variable to set")
        return
    }
    let host = state.last_var_assign
    // This is a empty body. We fill it for the users
    let cached_res = state.read_cache(host.input_hash)
    if (!cached_res) {
        // If it hasn't been evaluated and has no cache
        // We evaluate first and pust the result there
        cached_res = eval_and_cache(host, state.cache_table)
    }

    if (host.var_name == null)
        throw Error("Bug!!")
    make_set_node(cmd_node, host.var_name, host.input_hash, cached_res)

}


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned != null) {
        state.add_warning("The first child must be a body with a var inside")
        return
    }

    if (cmd_node.children.length == 0)
        set_empty(cmd_node, state)

    if (cmd_node.children[0]?.type != "body") {
        state.add_warning("The first child must be a body with a var inside")
        return
    }

    let var_use_node = cmd_node.children[0].children[0]
    if (var_use_node.type != "var_use") {
        state.add_warning("The first child must be a body with a var inside")
        return
    }

    let host = state.node_to_obj_host(var_use_node)

    // The set of variable must be in a certain scope

    if (state.last_var_assign != host) {
        state.add_warning("You must set a variable before any other variable is defined")
        return
    }

    if (host.status != host_type.Lazy) {
        state.add_warning("The variable to set is not a lazy variable")
        return
    }


    // We compare whether two hash match
    let hash_node = cmd_node.children[1]
    if (!hash_node) {
        state.add_warning("A hash must be provided")
        return
    }

    if (hash_node.type != "param") {
        state.add_warning("The sencond child should be a param with hash of input in side")
        return
    }

    if (hash_node.content_obj != host.input_hash) {
        // Hash mismatch
        return
    }

    let cache_content_node = cmd_node.children[2]
    if (!cache_content_node) {
        return
    }

    if (cache_content_node.type != "body") {
        state.add_warning("The content to set must be in a body")
        return
    }

    let content_host = new obj_host()
    store_literal_to_host(cache_content_node, state, content_host)
    if (content_host.status != host_type.Undef) {
        let in_doc_cached_content = content_host.get_content(state)
        state.save_cache(host.input_hash, in_doc_cached_content)
        host.set_content(in_doc_cached_content)
    }
}

export function set(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("set", simple_literal_parser))
    core.add_exec_rule("set", exec)
}