import {evomark_core} from "../../core"
import {parse_node} from "../../parse";
import {evomark_tokenizer, get_tag_pair, token, tokener_state} from "../../tokenize";
import {simple_parser} from "../../parse/common";


function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let [open, close] = get_tag_pair("h1")
    tokens.push(open)
    for (let child of root.children) {
        if (child.type == "body") {
            tokener.tokenize_children(child, tokens, state)
        }
    }
    tokens.push(close)
}

export function section(core: evomark_core) {

    core.parser.add_func_rule("sec", simple_parser)
    core.tokenizer.add_func_rule("sec", tokenize)

}