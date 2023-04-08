import { parse_node } from "./parse"


type func_tokenizer = (root: parse_node, tokens: token[], renderer: evomark_tokenizer) => void

var special_node_types = ["text", "func"]

export class evomark_tokenizer {
    public tokenize_rules_func: Record<string, tokeniz_rule_func>

    public constructor(){
        this.tokenize_rules_func = {}
        this.add_func_rule(new tokeniz_rule_func("box", tokenize_box))
    }

    public add_func_rule(rule: tokeniz_rule_func) {
        if (rule.name in this.tokenize_rules_func)
            throw Error("Trying to add a rule of the same name")
        this.tokenize_rules_func[rule.name] = rule
    }

    public tokenize_inline: func_tokenizer = (root: parse_node, tokens: token[]) => {

    }

    public tokenize_core(root: parse_node, tokens: token[]) {
        for (let child of root.children) {
            let type_i = special_node_types.indexOf(child.type)
            if (type_i < 0)
                throw Error("Node of " + child.type + " must be handled by a specific tokenizer")
            if (type_i == 0) {
                // text
                tokens.push(get_open_tag("span"))
                tokens.push(new token("text", child.content))
                tokens.push(get_close_tag("span"))
            } else if (type_i == 1) {
                // func
                let func_name = child.content
                let rule = this.tokenize_rules_func[func_name]
                if (!rule)
                    throw Error("No tokenizer for function" + func_name)
                rule.tokenize(child, tokens, this)
            }
        }
        return tokens
    }

    public tokenize(root: parse_node): token[] {
        let tokens = []
        this.tokenize_core(root, tokens)
        return tokens
    }


}


export class token {
    public type: string
    public content: string
    public constructor(type: string, content: string) {
        this.type = type
        this.content = content
    }
    public print(): string {
        return [this.type, ":", this.content].join("")
    }
}



type html_attr = Record<string, string>
export class tag_token extends token {
    private tag_type = -1
    public attrs: html_attr[]
    public constructor(tag: string, tag_type: number, attrs: html_attr[]) {
        super("tag", tag)
        this.attrs = attrs
        this.tag_type = tag_type
    }
    public print(): string {
        return ["<", this.tag_type != 1 ? "" : "/", this.content, this.tag_type != 2 ? "" : "/", ">"].join("")
    }
}

export function get_open_tag(tag: string){
    return new tag_token(tag, 0, null)
}

export function get_close_tag(tag: string){
    return new tag_token(tag, 1, null)
}

export function get_closed_tag(tag: string){
    return new tag_token(tag, 2, null)
}


export class tokeniz_rule_func {
    public tokenize: func_tokenizer
    public name: string
    public constructor(name: string, tokenize: func_tokenizer) {
        this.name = name
        this.tokenize = tokenize
    }
}

function tokenize_box(root: parse_node, tokens: token[], renderer: evomark_tokenizer){
    for(let child of root.children){
        if(child.type == "func_body"){
            tokens.push(get_open_tag("div"))
            renderer.tokenize_core(child, tokens)
            tokens.push(get_close_tag("div"))
        }
    }
    
}