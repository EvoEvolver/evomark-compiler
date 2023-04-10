import { evomark_core } from "../core"
import { evomark_parser, parse_node, parse_rule_func, parse_state } from "../parse";
import { evomark_tokenizer, get_close_tag, get_closed_tag, get_open_tag, get_tag_pair, push_warning, token, tokenize_rule_func, tokenize_box, tokener_state } from "../tokenize";


function parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean{
    return parser.parse_core(src, state)
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state){
    let [open, close] = get_tag_pair("FigureBox")
    tokens.push(open)
    let img_src: string
    let has_written_body = false
    for (let child of root.children) {
        if (child.type == "func_param") {
            if(typeof child.content_obj === 'string'){
                img_src = child.content_obj
            }else{
                img_src = child.content_obj["src"] 
            }
            if(!img_src){
                push_warning("A path must be provided", tokens)
                break
            }
            else{
                let img_token = get_closed_tag("img")
                img_token.attrs = {src: img_src}
                tokens.push(img_token)
            }
        }
        if (child.type == "func_body") {
            if(has_written_body){
                push_warning("Only one body is allowed", tokens)
                break
            }
            tokenize_box(child, tokens, tokener, state)
        }
    }
    tokens.push(close)
}

export function figure(core: evomark_core){

    core.parser.add_func_rule(new parse_rule_func("figure", parse))
    core.tokenizer.add_func_rule(new tokenize_rule_func("figure", tokenize))

}