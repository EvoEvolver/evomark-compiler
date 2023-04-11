import { evomark_core } from "../core"
import { evomark_parser, is_valid_identifier, parse_identifier, parse_node, parse_rule_func, parse_state } from "../parse";
import { parse_ref } from "../parse_ref";
import { evomark_tokenizer, get_closed_tag, get_tag_pair, push_warning, token, tokenize_rule_func, tokener_state } from "../tokenize";


function parse(src: string, state: parse_state, param: any, parser: evomark_parser): boolean {
    let content = state.slice_range(src).trim()
    if (content[0] != "@") {
        state.push_warning_node("#ref must contain a ref (like #ref{@my_ref})")
    }
    let ref_name = content.slice(1)
    if (is_valid_identifier(ref_name)) {
        state.curr_node.content = ref_name
    }
    else {
        state.curr_node.content = null
        state.push_warning_node("#ref must contain a ref (like #ref{@my_ref})")
    }
    return true
}

function tokenize(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    if (root.children.length != 1 || root.children[0].type != "func_body") {
        push_warning("#ref must have exactly one body", tokens)
        return
    }
    let child = root.children[0]
    let ref_name = child.content
    let [open, close] = get_tag_pair("PreviewLink")
    open.attrs["id"] = ref_name
    open.attrs["func"] = child.content
    let refered = state.ref_table[ref_name]
    if (refered) {
        tokens.push(open)
        //tokens.push(new token("text", state.ref_table[child.content].content + "."))
        //tokens.push(new token("text", child.content))
        tokens.push(close)
    }
    else{
        push_warning("Name "+ref_name+" is not defined!", tokens)
    }
}

export function ref(core: evomark_core) {

    core.parser.add_func_rule(new parse_rule_func("ref", parse))
    core.tokenizer.add_func_rule(new tokenize_rule_func("ref", tokenize))

    core.register_modules("ref", {
        "PreviewLink": "@/PreviewLink.vue"
    })

}