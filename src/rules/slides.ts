

import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_close_tag, get_closed_tag, get_open_tag, get_tag_pair, push_warning, token, tokenize_rule_func, tokener_state } from "../tokenize";


function parse_slides(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    parser.parse_core(src, state)
    for(let child of state.curr_node.children){
        if(child.type!="text"){
            if(child.type=="func" && child.content!="slide"){
                state.push_warning_node_to_root("Only #slide is allowed in #slides")
            }
        }
    }
    return true
}

function tokenize_slides(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    if(root.children.length==0){
        push_warning("#slides must have body", tokens)
        return
    }
    let body: parse_node, param: any
    if(root.children.length==1){
        if(root.children[0].type!="func_body"){
            push_warning("#slides must have body", tokens)
            return
        }
        else{
            param = {}
            body = root.children[0]
        }
            
    }
    if(root.children.length==2){
        if(root.children[0].type!="func_param" || root.children[1].type!="func_body"){
            push_warning("Improper #slides", tokens)
            return
        }
        else{
            param = root.children[0]
            body = root.children[1]
        }
    }
    let [open, close] = get_tag_pair("SlidesBox")
    tokens.push(open)
    state.env["slide"] = true
    tokener.tokenize_core(body, tokens, state)
    state.env["slide"] = false
    tokens.push(close)
}

function parse_slide(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    return parser.parse_core(src, state)
}

function tokenize_slide(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    let [open0, close0] = get_tag_pair("VueperSlide")
    let [open1, close1] = get_tag_pair("SlidesContent")
    tokens.push(open0)
    tokens.push(open1)
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokener.tokenize_core(child, tokens, state)
        }
    }
    tokens.push(close1)
    tokens.push(close0)
}


function parse_clk(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    return parser.parse_core(src, state)
}

function tokenize_clk(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    if(!state.env["slide"]){
        push_warning("#clk can only be used inside a #slides", tokens)
        return
    }
    let [open0, close0] = get_tag_pair("SlidesControl")
    tokens.push(open0)
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokener.tokenize_core(child, tokens, state)
        }
    }
    tokens.push(close0)
}


function parse_voice(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    // TODO check whether the input is full text
    return true
}

function tokenize_voice(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    let tag = get_closed_tag("SlidesVoiceBox")
    for (let child of root.children) {
        if (child.type == "func_body") {
            tag.attrs = {text:child.content.trim()}
            break
        }
    }
}



export function slides(core: evomark_core){

    core.parser.add_func_rule(new parse_rule_func("slides", parse_slides))
    core.tokenizer.add_func_rule(new tokenize_rule_func("slides", tokenize_slides))
    core.parser.add_func_rule(new parse_rule_func("slide", parse_slide))
    core.tokenizer.add_func_rule(new tokenize_rule_func("slide", tokenize_slide))
    core.parser.add_func_rule(new parse_rule_func("clk", parse_clk))
    core.tokenizer.add_func_rule(new tokenize_rule_func("clk", tokenize_clk))
    core.parser.add_func_rule(new parse_rule_func("voice", parse_voice))
    core.tokenizer.add_func_rule(new tokenize_rule_func("voice", tokenize_voice))

}



