import {evomark_core} from "../../core"
import {evomark_parser, parse_node, parse_state} from "../../parse";
import {evomark_tokenizer, get_closed_tag, get_tag_pair, push_warning, token, tokener_state} from "../../tokenize";
import {simple_literal_parser, simple_parser} from "../../parse/common";
import {get_pure_texts} from "../../tokenize/common";


function parse_slides(src: string, state: parse_state, parser: evomark_parser) {
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
        if (root.children[0].type != "body") {
            push_warning("#slides must have body", tokens)
            return
        } else {
            param = {}
            body = root.children[0]
        }

    }
    if (root.children.length == 2) {
        if (root.children[0].type != "param" || root.children[1].type != "body") {
            push_warning("Improper #slides", tokens)
            return
        } else {
            param = root.children[0]
            body = root.children[1]
        }
    }
    let [open, close] = get_tag_pair("SlidesBox")
    tokens.push(open)
    state.env["slide"] = true
    state.env["clk"] = []
    tokener.tokenize_children(body, tokens, state)
    state.env["clk"] = null
    state.env["slide"] = false
    tokens.push(close)
}

function tokenize_slide(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let [open, close] = get_tag_pair("Slide")
    tokens.push(open)
    for (let child of root.children) {
        if (child.type == "body") {
            tokener.tokenize_children(child, tokens, state)
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
        if (child.type == "param") {
            clk_in = Number(child.content)
        }
        if (child.type == "body") {
            // Check whether there is a valid clk_in id from param
            if (Number.isNaN(clk_in)) {
                push_warning("Invalid order for clk", tokens)
                break
            } else {
                if (clk_in < 0) {
                    clk_in = Math.ceil(Math.max(state.env["clk"])) + 1
                }
            }
            let [open, close] = get_tag_pair("SlidesControl")
            open.attrs[":clkIn"] = clk_in.toString()
            state.env["clk"].push(clk_in)
            tokens.push(open)
            tokener.tokenize_children(child, tokens, state)
            tokens.push(close)
            break
        }
    }
}


function tokenize_voice(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let tag = get_closed_tag("SlidesVoiceBox")
    for (let child of root.children) {
        if (child.type == "body") {
            let voice_text = get_pure_texts(child.children)
            tag.attrs = {text: voice_text}
            tokens.push(tag)
            break
        }
    }
}


export function slides(core: evomark_core) {

    core.parser.add_func_rule("slides", parse_slides)
    core.tokenizer.add_func_rule("slides", tokenize_slides)
    core.parser.add_func_rule("slide", simple_parser)
    core.tokenizer.add_func_rule("slide", tokenize_slide)
    core.parser.add_func_rule("clk", simple_parser)
    core.tokenizer.add_func_rule("clk", tokenize_clk)
    core.parser.add_func_rule("voice", simple_literal_parser)
    core.tokenizer.add_func_rule("voice", tokenize_voice)

    core.register_modules("slides", {
        "SlidesBox": "@/slides/SlidesBox.vue",
        "Slide": "@/slides/Slide.vue",
        "SlidesControl": "@/slides/SlidesControl.vue",
        "SlidesVoiceBox": "@/slides/SlidesVoiceBox.vue",
    })
}



