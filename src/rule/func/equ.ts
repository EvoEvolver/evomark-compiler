import {evomark_core} from "../../core"
import {parse_node} from "../../parse";
import {evomark_tokenizer, get_tag_pair, token, tokener_state} from "../../tokenize";
import {renderToString} from "katex"
import {simple_literal_parser} from "../../parse/common";


function extract_literal(node: parse_node, res: string[]){
    for (let child of node.children) {
        if (child.type == "literal") {
            res.push(child.content)
        }
        else if(child.type == "fragment"){
            extract_literal(child, res)
        }
    }
}


function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let body: parse_node
    for (let child of root.children) {
        if (child.type == "body") {
            body = child
            break
        }
    }
    if(!body){
        return
    }
    let [open, close] = get_tag_pair("span")
    let res = []
    extract_literal(body, res)
    let content = res.join(" ").trim()
    tokens.push(open)
    tokens.push(new token("literal", renderToString(content,
        {
            throwOnError: false,
            macros: {},
            output: "html"
        }
    )))
    tokens.push(close)
}

export function equ(core: evomark_core) {
    core.add_rule("equ", simple_literal_parser, tokenize, {})
}