import { evomark_core } from "../core"
import { evomark_parser, parse_node, func_rule, parse_state } from "../parse";
import { evomark_tokenizer, get_tag_pair, token, tokener_state, tokenize_rule_func } from "../tokenize";
import { simple_parser } from "../parser/common";


function parse(src:string, state: parse_state, parser: evomark_parser){
    // Set the handle_ref of the func node
    state.curr_node.parent.meta["handle_ref"] = true
    simple_parser(src, state, parser)
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    let [open, close] = get_tag_pair("Remark")
    tokens.push(open)
    let title: string
    let type: string
    for (let child of root.children) {
        if (child.type == "func_param") {
            let param = child.content_obj
            if(param || typeof param === 'object'){
                title = param.title
                type = param.type
            }
        }
        if (child.type == "func_body") {
            // Decide the type when not provided in param
            if(!type){
                if(child.children.length == 1 && child.children[0].type == "func"){
                    type = child.children[0].content
                    type = type.charAt(0).toUpperCase() + type.slice(1);
                }
                else{
                    type = "Remark"
                }
            }
            let index = state.get_available_index(type)
            open.attrs = {title: title, type: type, index: index.toString()}
            if(root.meta.ref_name){
                open.attrs["id"] = root.meta.ref_name
                root.parent.meta["ref_data"].display_name = type+" "+index.toString()
            }
            tokener.tokenize_core(child, tokens, state)
            break
        }
    }
    tokens.push(close)
}

export function remark(core: evomark_core) {
    core.add_rule("remark", parse, tokenize, {
        "Remark": "@/Remark.vue"
    })
}
