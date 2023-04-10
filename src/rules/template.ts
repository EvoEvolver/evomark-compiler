import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, token, tokenize_rule_func, tokener_state } from "../tokenize";


function parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    return true
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    
}

export function equ_rule(core: evomark_core){

    core.parser.add_func_rule(new parse_rule_func("equ", parse))
    core.tokenizer.add_func_rule(new tokenize_rule_func("equ", tokenize))

}