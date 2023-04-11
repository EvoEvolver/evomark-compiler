import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_closed_tag, token, tokener_state, tokenize_rule_func } from "../tokenize";


function parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    return true
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    for (let child of root.children) {
        if (child.type == "func_body") {
            let token = get_closed_tag("Equ")
            token.attrs = {"tex": child.content.trim()}
            tokens.push(token)
        }
    }
}

export function equ(core: evomark_core){
    core.add_rule("equ", parse, tokenize, {
        "Equ": "@/Equ.vue"
    })
}