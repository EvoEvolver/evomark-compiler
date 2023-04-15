import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_tag_pair, token, tokener_state, tokenize_rule_func } from "../tokenize";
import { simple_parser } from "./common";

export function make_simple_rule(func_name: string, tag_name: string) {

    function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
        let [open, close] = get_tag_pair(tag_name)
        tokens.push(open)
        for (let child of root.children) {
            if (child.type == "func_body") {
                tokener.tokenize_core(child, tokens, state)
            }
        }
        tokens.push(close)
    }
    function config(core: evomark_core) {
        core.parser.add_func_rule(new parse_rule_func(func_name, simple_parser))
        core.tokenizer.add_func_rule(new tokenize_rule_func(func_name, tokenize))
    }
    return config
}

export var em = make_simple_rule("em", "strong")