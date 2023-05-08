import {evomark_core} from "../../core"
import {default_core_rules, evomark_parser, parse_core_with_rules, parse_node, parse_state} from "../../parse";
import {evomark_tokenizer, get_close_tag, get_open_tag, get_tag_pair, token, tokener_state} from "../../tokenize";
import {simple_parser} from "../../parse/common";
import {normal_breaking_chars, parse_literal} from "../../parse/parse_text";


const list_starter = "-"
function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let body
    for (let child of root.children) {
        if (child.type == "body") {
            body = child
            break
        }
    }
    if(!body)
        return

    let has_prev_list = false
    let prev_level = 0
    for(let child of body.children){
        if(child.type == "literal" && child.meta["list_starter"] === true){
            if(has_prev_list) {
                tokens.push(get_close_tag("li"))
            }
            let level = child.content.length
            for(let i = 0; i < prev_level - level; i++){
                tokens.push(get_close_tag("ul"))
            }
            for(let i = 0; i < level - prev_level; i++){
                tokens.push(get_open_tag("ul"))
            }
            prev_level = level
            tokens.push(get_open_tag("li"))
            has_prev_list = true
        }
        else{
            tokener.tokenize_node(child, tokens, state)
        }
    }
    if(has_prev_list) {
        tokens.push(get_close_tag("li"))
    }
    for(let i = 0; i < prev_level; i++){
        tokens.push(get_close_tag("ul"))
    }
}


function parse_stick(src: string, state: parse_state, parser: evomark_parser): boolean {
    if(list_starter.indexOf(src[state.pos]) < 0){
        return false
    }
    let starter = src[state.pos]
    let num_space = 0
    for(let i = state.pos-1; i > state.start; i--){
        if(src[i] == " "){
            num_space++
            continue
        }
        if(src[i] == "\n"){
            break
        }
        else{
            // Just a normal stick
            state.push_node("literal").set_content(src[state.pos])
            state.pos++
            return true
        }
    }
    // We find it's a stick with a new line before it
    let level = 1
    for(let i = state.pos+1; i < src.length; i++){
        if(src[i] == starter){
            level++
        }
        else{
            break
        }
    }
    let list_node = state.push_node("literal").set_content(src[state.pos].repeat(level))
    list_node.meta["list_starter"] = true
    list_node.meta["num_space"] = num_space
    state.pos += level
    return true
}

function parse(src: string, state: parse_state, parser: evomark_parser){
    for (let node of state.curr_node.children) {
        if (node.type == "body") {
            let [body_start, body_end] = node.delim
            let saved = state.set_local_state(body_start, body_start, body_end, node)
            parse_core_with_rules(src, state, list_core_rules, parser)
            state.restore_state(saved)
            break
        }
    }
}

const list_core_rules = []

const list_breaking_chars = normal_breaking_chars + list_starter

const list_breaking_regex = new RegExp(`[${list_breaking_chars}]`)

export function parse_literal_in_list(src: string, state: parse_state, parser: evomark_parser): boolean {
    return parse_literal(src, state, parser, list_breaking_regex)
}

export function list(core: evomark_core) {
    for(let rule of default_core_rules){
        if(rule.name != "parse_normal_breaking_literal"){
            list_core_rules.push(rule)
        }
        else{
            list_core_rules.push(parse_literal_in_list)
        }
    }
    list_core_rules.push(parse_stick)
    core.parser.add_func_rule("list", parse)
    core.tokenizer.add_func_rule("list", tokenize)
}