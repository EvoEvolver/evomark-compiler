import {evomark_core} from "../../core"
import {func_rule, parse_node} from "../../parser";
import {evomark_tokenizer, get_tag_pair, token, tokener_state, tokenize_rule_func} from "../../tokenize";
import {simple_parser} from "../../parser/common";

export function make_simple_rule(func_name: string, tag_name: string) {

    function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
        let [open, close] = get_tag_pair(tag_name)
        tokens.push(open)
        for (let child of root.children) {
            if (child.type == "body") {
                tokener.tokenize_core(child, tokens, state)
            }
        }
        tokens.push(close)
    }

    function config(core: evomark_core) {
        core.parser.add_func_rule(new func_rule(func_name, simple_parser))
        core.tokenizer.add_func_rule(new tokenize_rule_func(func_name, tokenize))
    }

    return config
}

export var em = make_simple_rule("em", "strong")