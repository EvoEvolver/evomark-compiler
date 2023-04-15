import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_close_tag, get_open_tag, get_tag_pair, token, tokenize_rule_func, tokener_state } from "../tokenize";
import { simple_parser } from "./common";


function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    let [open, close] = get_tag_pair("ul")
    tokens.push(open)
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokens.push(get_open_tag("li"))
            tokener.tokenize_core(child, tokens, state)
            tokens.push(get_close_tag("li"))
        }
    }
    tokens.push(close)
}

export function list(core: evomark_core){

    core.parser.add_func_rule(new parse_rule_func("list", simple_parser))
    core.tokenizer.add_func_rule(new tokenize_rule_func("list", tokenize))

}