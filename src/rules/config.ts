import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, token, tokener_state, tokenize_rule_func } from "../tokenize";
import { parse_dict } from "../utils/dict";
import { from_body_wise_parse } from "./common";

export function make_config_rule(func_name: string, namespace: string) {
    function body_wise_parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean {
        let lang = "toml"
        if (typeof param === 'string') {
            lang = param
        }
        else if (param !== null) {
            lang = param["lang"]
        }
        let config_src = state.curr_node.content
        if (lang == "string")
            config_src = ["{", config_src, "}"].join("\n")
        let config_dict = parse_dict(config_src, lang, state)
        if (config_dict) {
            let node = state.push_node("hidden_literal")
            node.content = config_src.trim()
            //node.content_obj = config_dict
            state.assign_to_config(config_dict, namespace)
        }
        return true
    }

    function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {

    }
    function config(core: evomark_core) {
        core.parser.init_state_config[namespace] = {}
        core.parser.add_func_rule(new parse_rule_func(func_name, from_body_wise_parse(body_wise_parse)))
        core.tokenizer.add_func_rule(new tokenize_rule_func(func_name, tokenize))
    }
    return config
}

export var config = make_config_rule("config", null)