import {evomark_core} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec";
import {parse_node} from "../../parse";
import {simple_literal_parser} from "../../parse/common";
import {get_param_body_pairs, set_lazy_variable_with_input} from "../utils";
import {query_lm_sync} from "../../model/language/openai";


function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let input = {}
    let texts = []
    let param_body_pairs = get_param_body_pairs(cmd_node)
    for (let [, body] of param_body_pairs) {
        let [text] = eval_to_text(body.children, state)
        texts.push(text)
    }
    if (texts.length < 1) {
        state.add_fatal("There must be one body as input")
        return
    }
    input["prompt"] = texts[0]
    if (texts.length >= 2) {
        input["echo"] = texts[1]
    }
    if (texts.length >= 3) {
        input["suffix"] = texts[2]
    }
    set_lazy_variable_with_input(state, input, assigned, "lm", query_lm_sync)
}

export function lm(core: evomark_core) {
    core.add_cmd_rule("lm", simple_literal_parser)
    core.add_exec_rule("lm", exec)
}