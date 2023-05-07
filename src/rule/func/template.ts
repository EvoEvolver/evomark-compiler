import {evomark_core} from "../../core"
import {evomark_parser, func_rule, parse_node, parse_state} from "../../parser";
import {evomark_tokenizer, token, tokener_state, tokenize_rule_func} from "../../tokenize";


function parse(src: string, state: parse_state, parser: evomark_parser) {
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
}

export function xxx_rule(core: evomark_core) {

    core.parser.add_func_rule(new func_rule("xxx", parse))
    core.tokenizer.add_func_rule(new tokenize_rule_func("xxx", tokenize))

}