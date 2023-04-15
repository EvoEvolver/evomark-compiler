

import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_close_tag, get_closed_tag, get_open_tag, get_tag_pair, push_warning, token, tokenize_rule_func, tokener_state } from "../tokenize";
import { simple_literal_parser, simple_parser } from "./common";


function parse_slides(src:string, state: parse_state, parser: evomark_parser){
    simple_parser(src, state, parser)
    for (let child of state.curr_node.children) {
        if (child.type != "text") {
            if (child.type == "func" && child.content != "slide") {
                state.push_warning_node_to_root("Only #slide is allowed in #slides")
            }
        }
    }
}

function tokenize_slides(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    if (root.children.length == 0) {
        push_warning("#slides must have body", tokens)
        return
    }
    let body: parse_node, param: any
    if (root.children.length == 1) {
        if (root.children[0].type != "func_body") {
            push_warning("#slides must have body", tokens)
            return
        }
        else {
            param = {}
            body = root.children[0]
        }

    }
    if (root.children.length == 2) {
        if (root.children[0].type != "func_param" || root.children[1].type != "func_body") {
            push_warning("Improper #slides", tokens)
            return
        }
        else {
            param = root.children[0]
            body = root.children[1]
        }
    }
    let [open, close] = get_tag_pair("SlidesBox")
    tokens.push(open)
    state.env["slide"] = true
    state.env["clk"] = []
    tokener.tokenize_core(body, tokens, state)
    state.env["clk"] = null
    state.env["slide"] = false
    tokens.push(close)
}

function tokenize_slide(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let [open, close] = get_tag_pair("Slide")
    tokens.push(open)
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokener.tokenize_core(child, tokens, state)
        }
    }
    tokens.push(close)
}


function tokenize_clk(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    if (!state.env["slide"]) {
        push_warning("#clk can only be used inside a #slides", tokens)
        return
    }

    let clk_in = -1
    for (let child of root.children) {
        if (child.type == "func_param") {
            clk_in = Number(child.content)
        }
        if (child.type == "func_body") {
            // Check whether there is a valid clk_in id from param
            if (Number.isNaN(clk_in)) {
                push_warning("Invalid order for clk", tokens)
                break
            }
            else {
                if (clk_in < 0) {
                    clk_in = Math.ceil(Math.max(state.env["clk"]))+1
                }
            }
            let [open, close] = get_tag_pair("SlidesControl")
            open.attrs[":clkIn"] = clk_in.toString()
            state.env["clk"].push(clk_in)
            tokens.push(open)
            tokener.tokenize_core(child, tokens, state)
            tokens.push(close)
            break
        }
    }
}


function tokenize_voice(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let tag = get_closed_tag("SlidesVoiceBox")
    for (let child of root.children) {
        if (child.type == "func_body") {
            tag.attrs = { text: child.content.trim() }
            tokens.push(tag)
            break
        }
    }
}



export function slides(core: evomark_core) {

    core.parser.add_func_rule(new parse_rule_func("slides", parse_slides))
    core.tokenizer.add_func_rule(new tokenize_rule_func("slides", tokenize_slides))
    core.parser.add_func_rule(new parse_rule_func("slide", simple_parser))
    core.tokenizer.add_func_rule(new tokenize_rule_func("slide", tokenize_slide))
    core.parser.add_func_rule(new parse_rule_func("clk", simple_parser))
    core.tokenizer.add_func_rule(new tokenize_rule_func("clk", tokenize_clk))
    core.parser.add_func_rule(new parse_rule_func("voice", simple_literal_parser))
    core.tokenizer.add_func_rule(new tokenize_rule_func("voice", tokenize_voice))

    core.register_modules("slides", {
        "SlidesBox": "@/slides/SlidesBox.vue",
        "Slide": "@/slides/Slide.vue",
        "SlidesControl": "@/slides/SlidesControl.vue",
        "SlidesVoiceBox": "@/slides/SlidesVoiceBox.vue",
    })
}



