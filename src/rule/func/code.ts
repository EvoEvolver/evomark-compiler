import {evomark_core} from "../../core"
import {parse_node} from "../../parser";
import {evomark_tokenizer, get_tag_pair, token, tokener_state} from "../../tokenize";
import {renderToString} from "katex"
import {simple_literal_parser} from "../../parser/common";

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    for (let child of root.children) {
        if (child.type == "body") {
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

export function code(core: evomark_core) {
    core.add_rule("code", simple_literal_parser, tokenize, {
        "Code": "@/Code.vue"
    })
}