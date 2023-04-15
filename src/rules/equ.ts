import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_closed_tag, get_tag_pair, token, tokener_state, tokenize_rule_func } from "../tokenize";
import { renderToString } from "katex"
import { simple_literal_parser } from "./common";


function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    for (let child of root.children) {
        if (child.type == "func_body") {
            let [open, close] = get_tag_pair("span")
            tokens.push(open)
            tokens.push(new token("literal", renderToString(child.content.trim(),
                {
                    throwOnError: false,
                    macros: {},
                    output: "html"
                }
            )))
            tokens.push(close)
            break
        }
    }
}

export function equ(core: evomark_core) {
    core.add_rule("equ", simple_literal_parser, tokenize, {})
}