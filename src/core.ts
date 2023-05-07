import {evomark_exec} from "./exec"
import {evomark_parser, func_parser, parse_node, parse_state} from "./parse"
import {stringify} from "./prettier"
import {evomark_tokenizer, func_tokenizer, token} from "./tokenize"
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

    public process(src: string, config: any, file_path: string): proc_state {
        if (!config) {
            config = {}
        }
        let [root, parse_state] = this.parser.parse(src, config)
        let proc_state = get_proc_state_from_parse(parse_state, root)
        this.exec(file_path, root, proc_state)
        let [tokens, tokener_state] = this.tokenizer.tokenize(root, parse_state)
        let [rendered,page_env] = this.process_tokens(tokens, tokener_state)
        proc_state.rendered = rendered
        return proc_state
    }

    public exec(file_path: string, root: parse_node, proc_state: proc_state) {
        let ctx: any
        if (fs.existsSync(file_path + ".ctx.json")) {
            let json_raw = fs.readFileSync(file_path + ".ctx.json", {encoding: 'utf8'})
            if (json_raw.trim().length == 0)
                json_raw = "{}"
            ctx = JSON.parse(json_raw)
        } else {
            ctx = {}
        }
        let exec_ctx = this.executor.exec(root, ctx, this, proc_state)
        let res = stringify(root)
        fs.writeFileSync(file_path + ".ctx.json", JSON.stringify(exec_ctx.get_ctx()))
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

        let page_env = {
            title: config?.title
        }

        return [render_res.join(""), page_env]
    }
}

export type proc_state = {
    config: any,
    ref_map: any,
    root: parse_node,
    tokens?: token[],
    rendered?: string
}
export function get_proc_state_from_parse(parse_state: parse_state, root: parse_node): proc_state{
    return {
        config: parse_state.config,
        ref_map: parse_state.ref_table,
        root: root
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