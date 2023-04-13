import { parse_node, parse_state } from "./parse"
import { escapeHtml } from "./utils/html"


export type func_tokenizer = (root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) => void


export class evomark_tokenizer {

    public modules: Record<string, any>

    public init_state_config = ()=>{
        return {}
    }

    public tokenize_rules_func: Record<string, tokenize_rule_func>

    public constructor() {
        this.tokenize_rules_func = {}
        this.add_func_rule(new tokenize_rule_func("box", tokenize_box))
        this.modules = {
            ref_def : {
                Referred: "@/Referred.vue"
            }
        }
    }

    public add_func_rule(rule: tokenize_rule_func) {
        if (rule.name in this.tokenize_rules_func)
            throw Error("Trying to add a rule of the same name")
        this.tokenize_rules_func[rule.name] = rule
    }

    public tokenize_core(root: parse_node, tokens: token[], state: tokener_state) {
        for (let child of root.children) {
            switch (child.type) {
                case "text": {
                    tokens.push(get_open_tag("span").set_class("text"))
                    tokens.push(new token("text", child.content))
                    tokens.push(get_close_tag("span"))
                    break
                }
                case "func": {
                    let func_name = child.content
                    let rule = this.tokenize_rules_func[func_name]
                    state.used_func[func_name] = ""
                    if (!rule){
                        //throw Error("No tokenizer for function " + func_name)
                        rule = this.tokenize_rules_func["box"]
                        push_warning("No tokenizer for function " + func_name, tokens)
                    }
                    rule.tokenize(child, tokens, this, state)
                    break
                }
                case "ref":{
                    let ref_name = child.content
                    if(!("ref_def" in state.used_func)){
                        state.used_func["ref_def"] = ""
                    }
                    let [open, close] = get_tag_pair("Referred")
                    open.attrs["id"] = ref_name
                    open.attrs["func"] = child.children[0].content
                    tokens.push(open)
                    this.tokenize_core(child, tokens, state)
                    tokens.push(close)
                    break
                }
                case "sep":{
                    tokens.push(new tag_token("br", 0, null))
                    break
                }
                case "warning": {
                    push_warning(child.content, tokens)
                    break
                }
                default: {
                    throw Error("Node of " + child.type + " must be handled by a specific tokenizer")
                }
            }
        }
        return tokens
    }
    public tokenize(root: parse_node, parse_state: parse_state): [token[], tokener_state] {
        let tokens = []
        let state = new tokener_state(parse_state)
        this.tokenize_core(root, tokens, state)
        return [tokens, state]
    }

    public get_component_imports(state: tokener_state){
        let used_func = state.used_func
        let res = []
        for(let func_name in used_func){
            let modules = this.modules[func_name]
            if(!modules)
                continue
            for(let module_name in modules){
                let module_path = modules[module_name]
                res.push(`import ${module_name} from "${module_path}"\n`)
            }
        }
        return res.join("")
    }

}

export class tokener_state{
    public config: any = null
    public ref_table: Record<string, parse_node>
    public used_func: any = {}
    public env: Record<string, any> = {}
    public constructor(parse_state: parse_state){
        this.ref_table = parse_state.ref_table
        this.config = parse_state.config
    }
}


export class token {
    public type: string
    public content: string
    public constructor(type: string, content: string) {
        this.type = type
        this.content = content
    }
    public write(): string {
        //return [this.type, ":", this.content].join("")
        return this.content
    }
}



type html_attr = Record<string, string>
export class tag_token extends token {
    private tag_type = -1
    public attrs: html_attr
    public pair = null
    public constructor(tag: string, tag_type: number, attrs: html_attr) {
        super("tag", tag)
        this.attrs = attrs
        this.tag_type = tag_type
    }
    public write(): string {
        let tag = ["<", this.tag_type != 1 ? "" : "/", this.content, write_attr(this.attrs), this.tag_type != 2 ? "" : "/", ">"].join("")
        if(["span", "strong"].indexOf(this.content)<0){
            return tag+"\n"
        }
        else{
            return tag
        }
    }
    public set_attr(attrs: html_attr): tag_token{
        this.attrs = attrs
        return this
    }
    public set_class(className: string): tag_token{
        this.attrs["class"] = className
        return this
    }
}

export function push_warning(message: string, tokens: token[]){
    tokens.push(get_open_tag("Warning"))
    tokens.push(new token("text", message))
    tokens.push(get_close_tag("Warning"))
}


function write_attr(attrs: html_attr) {
    if (!attrs) return ""
    let res = []
    let keys = Object.keys(attrs)
    let values = Object.values(attrs)
    for (let i = 0; i < keys.length; i++) {
        res.push(" ")
        res.push(keys[i])
        res.push("=\"")
        res.push(escapeHtml(values[i]))
        res.push("\"")
    }
    return res.join("")
}

export function get_tag_pair(tag: string) {
    let open = get_open_tag(tag)
    let close = get_close_tag(tag)
    open.pair = close
    return [open, close]
}

export function get_open_tag(tag: string) {
    return new tag_token(tag, 0, {})
}

export function get_close_tag(tag: string) {
    return new tag_token(tag, 1, null)
}

export function get_closed_tag(tag: string) {
    return new tag_token(tag, 2, null)
}


export class tokenize_rule_func {
    public tokenize: func_tokenizer
    public name: string
    public constructor(name: string, tokenize: func_tokenizer) {
        this.name = name
        this.tokenize = tokenize
    }
}

export function tokenize_box(root: parse_node, tokens: token[], tokener: evomark_tokenizer, state: tokener_state) {
    for (let child of root.children) {
        if (child.type == "func_body") {
            tokens.push(get_open_tag("div"))
            tokener.tokenize_core(child, tokens, state)
            tokens.push(get_close_tag("div"))
        }
    }
}