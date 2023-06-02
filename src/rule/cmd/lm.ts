import {evomark_core} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_param_body_pairs, set_cached_obj_with_eval} from "../utils";
import {query_lm_async} from "../../model/language/openai";


async function exec(cmd_node: parse_node, state: exec_state) {
    let input = {}
    let texts = []
    let param_body_pairs = get_param_body_pairs(cmd_node)
    for (let [, body] of param_body_pairs) {
        let {text} = await eval_to_text(body.children, state)
        texts.push(text)
    }
    if (texts.length < 1) {
        state.add_fatal("There must be one body as input")
        return
    }
    let has_undefined = false
    input["prompt"] = texts[0]
    if (texts[0] == null) {
        has_undefined = true
    }
    if (texts.length >= 2) {
        input["echo"] = texts[1]
        if (texts[1] == null) {
            has_undefined = true
        }
    }
    if (texts.length >= 3) {
        input["suffix"] = texts[2]
        if (texts[2] == null) {
            has_undefined = true
        }
    }
    if (has_undefined) {
        state.add_fatal("There must be no undefined input")
        return
    }
    let assigned = new obj_host()
    assigned.defined = true
    set_cached_obj_with_eval(state, input, assigned, "lm", query_lm_async)
    return assigned
}

export function lm(core: evomark_core) {
    core.add_cmd_rule("lm", simple_literal_parser)
    core.add_exec_rule("lm", exec)
}