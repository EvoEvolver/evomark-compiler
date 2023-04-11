import { evomark_parser, func_parser, parse_rule_func } from "./parse"
import { evomark_tokenizer, func_tokenizer, tokener_state, tokenize_rule_func } from "./tokenize"


export class evomark_core {

    public parser: evomark_parser
    public tokenizer: evomark_tokenizer

    public constructor() {
        this.parser = new evomark_parser()
        this.tokenizer = new evomark_tokenizer()
    }

    public add_parse_rule(name: string, parse: func_parser){
        this.parser.add_func_rule(new parse_rule_func("equ", parse))
    
    }

    public add_tokenizer_rule(name: string, tokenize: func_tokenizer){
        this.tokenizer.add_func_rule(new tokenize_rule_func("equ", tokenize))
    }

    public register_modules(name: string, modules: any){
        this.tokenizer.modules[name] = modules
    }

    public add_rule(name: string, parse: func_parser, tokenize: func_tokenizer, modules: any){
        this.add_parse_rule(name, parse)
        this.add_tokenizer_rule(name, tokenize)
        this.register_modules(name, modules)
    }

    public process(src: string) {
        let [root, parse_state] = this.parser.parse(src)
        console.log(root.write_tree())
        let [tokens, tokener_state] = this.tokenizer.tokenize(root, parse_state)
        let render_res = ["<template>\n"]
        for (let token of tokens) {
            render_res.push(token.write())
        }
        render_res.push("\n</template>\n\n")
        render_res.push("<script setup>\n")
        render_res.push(this.tokenizer.get_component_imports(tokener_state))
        render_res.push("</script>\n")
        console.log(render_res.join(""))
    }


}

export type func_rule = (evomark_core) => void