import { cmd_rule, evomark_parser, func_parser, func_rule } from "./parse"
import { evomark_tokenizer, func_tokenizer, tokener_state, tokenize_rule_func } from "./tokenize"


export class evomark_core {

    public parser: evomark_parser
    public tokenizer: evomark_tokenizer

    public constructor() {
        this.parser = new evomark_parser()
        this.tokenizer = new evomark_tokenizer()
    }

    public add_parse_func(name: string, parse: func_parser) {
        this.parser.add_func_rule(new func_rule(name, parse))
    }

    public add_parse_cmd(name: string, parse: func_parser) {
        this.parser.add_cmd_rule(new cmd_rule(name, parse))
    }

    public add_tokenizer_rule(name: string, tokenize: func_tokenizer) {
        this.tokenizer.add_func_rule(new tokenize_rule_func(name, tokenize))
    }

    public register_modules(name: string, modules: any) {
        this.tokenizer.modules[name] = modules
    }

    public add_rule(name: string, parse: func_parser, tokenize: func_tokenizer, modules: any) {
        this.add_parse_func(name, parse)
        this.add_tokenizer_rule(name, tokenize)
        this.register_modules(name, modules)
    }

    public process(src: string, emconfig: any): [string, any] {
        if (!emconfig) {
            emconfig = {}
        }
        let [root, parse_state] = this.parser.parse(src, emconfig)
        
        let [tokens, tokener_state] = this.tokenizer.tokenize(root, parse_state)
        let render_res = ["<template>\n<Document>\n"]
        for (let token of tokens) {
            render_res.push(token.write())
        }
        render_res.push("\n</Document>\n</template>\n\n")
        render_res.push("<script setup>\n")
        push_default_scripts(render_res)
        render_res.push(this.tokenizer.get_component_imports(tokener_state))
        render_res.push("</script>\n")
        render_res.push("<script>\n")
        render_res.push(`export const documentProps = {title: '${tokener_state.config?.title || "Evomark project"}'}\n`)
        render_res.push("</script>\n")
        let config = tokener_state.config

        let page_info = {
            title: config?.title
        }

        return [render_res.join(""), page_info]
    }


}

function push_default_scripts(render_res: string[]) {
    render_res.push('import { provide, inject } from "vue"\n')
    render_res.push('import emconfig from "@root/emconfig.json"\n')
    render_res.push('provide("emconfig", emconfig)\n')
    render_res.push('import emctx from "@root/emctx.json"\n')
    render_res.push('provide("emctx", emctx)\n')
    render_res.push('import Document from "@/Document.vue"\n')
    render_res.push('import Warning from "@/Warning.vue"\n')
}

export type generic_rule = (core: evomark_core) => void