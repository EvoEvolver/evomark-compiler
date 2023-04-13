import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_tag_pair, token, tokener_state, tokenize_rule_func } from "../tokenize";


function parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean {
    return parser.parse_core(src, state)
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let [open, close] = get_tag_pair("Remark")
    tokens.push(open)
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokener.tokenize_core(child, tokens, state)
        } 
    }
    tokens.push(close)
}

export function remark(core: evomark_core) {
    core.add_rule("remark", parse, tokenize, {
        "Remark": "@/Remark.vue"
    })
}
