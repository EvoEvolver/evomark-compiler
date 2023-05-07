import {evomark_exec} from "./exec/exec"
import {evomark_parser, func_parser, parse_node} from "./parse"
import {stringify} from "./prettier"
import {evomark_tokenizer, func_tokenizer} from "./tokenize"
import * as fs from 'fs'

export class evomark_core {

    public parser: evomark_parser
    public tokenizer: evomark_tokenizer
    public executor: evomark_exec

    public constructor() {
        this.parser = new evomark_parser()
        this.tokenizer = new evomark_tokenizer()
        this.executor = new evomark_exec()
    }

    public add_exec_rule(name: string, func) {
        this.executor.add_rule(name, func)
    }

    public add_func_rule(name: string, parse: func_parser) {
        this.parser.add_func_rule(name, parse)
    }

    public add_cmd_rule(name: string, parse: func_parser) {
        this.parser.add_cmd_rule(name, parse)
    }

    public add_tokenizer_rule(name: string, tokenize: func_tokenizer) {
        this.tokenizer.add_func_rule(name, tokenize)
    }

    public register_modules(name: string, modules: any) {
        this.tokenizer.modules[name] = modules
    }

    public add_rule(name: string, parse: func_parser, tokenize: func_tokenizer, modules: any) {
        this.add_func_rule(name, parse)
        this.add_tokenizer_rule(name, tokenize)
        this.register_modules(name, modules)
    }

    public process(src: string, emconfig: any, file_path: string): [string, any] {
        if (!emconfig) {
            emconfig = {}
        }
        let [root, parse_state] = this.parser.parse(src, emconfig)
        console.log(root.write_tree())
        this.exec(file_path, root, src)
        let [tokens, tokener_state] = this.tokenizer.tokenize(root, parse_state)
        return this.process_tokens(tokens, tokener_state)
    }

    public exec(file_path: string, root: parse_node, old_src: string) {
        let ctx: any
        if (fs.existsSync(file_path + ".ctx.json")) {
            let json_raw = fs.readFileSync(file_path + ".ctx.json", {encoding: 'utf8'})
            if (json_raw.trim().length == 0)
                json_raw = "{}"
            ctx = JSON.parse(json_raw)
        } else {
            ctx = {}
        }
        let exec_state = this.executor.exec(root, ctx)
        let res = stringify(root)
        fs.writeFileSync(file_path + ".ctx.json", JSON.stringify(exec_state.get_ctx()))
        fs.writeFileSync(file_path + ".bak", old_src)
        fs.writeFileSync(file_path, res)
    }

    public process_tokens(tokens, tokener_state): [string, any] {
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