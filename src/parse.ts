

import { parse_cmd, parse_cmd_var } from "./parser/parse_cmd"
import { parse_func } from "./parser/parse_func"
import { parse_ref_assign } from "./parser/parse_ref"
import { parse_text } from "./parser/parse_text"
import { simple_parser } from "./parser/common"
import { cmd_exec_state } from "./cmd_exec"


export class evomark_parser {

    public func_rules: Record<string, func_rule>
    public cmd_rules: Record<string, cmd_rule>

    public init_state_config = () => {
        return {}
    }

    public constructor() {
        this.func_rules = {}
        this.cmd_rules = {}
        this.add_func_rule(new func_rule("box", simple_parser))
    }

    public add_func_rule(rule: func_rule) {
        if (rule.name in this.func_rules)
            throw Error("Trying to add a rule of the same name: " + rule.name)
        this.func_rules[rule.name] = rule
    }

    public add_cmd_rule(rule: cmd_rule) {
        if (rule.name in this.func_rules)
            throw Error("Trying to add a rule of the same name: " + rule.name)
        this.cmd_rules[rule.name] = rule
    }

    public parse_core(src: string, state: parse_state): boolean {
        while (state.pos != state.end) {
            // Merge multiple \n
            parse_sep(src, state, this)
            // Try rules
            if (parse_text(src, state, this))
                continue
            if (parse_func(src, state, this))
                continue
            if (parse_ref_assign(src, state, this))
                continue
            if (parse_cmd_var(src, state, this))
                continue
            if (parse_cmd(src, state, this))
                continue
            if (state.pos == state.end)
                break
            console.log("There is no available rules. Abort.")
            return false
        }
        return true
    }

    public parse(src: string, emconfig: any): [parse_node, parse_state] {
        let state = new parse_state(src, emconfig)
        state.config = this.init_state_config()
        this.parse_core(src, state)
        return [state.root_node, state]
    }
}

export function parse_sep(src: string, state: parse_state, parser: evomark_parser): void {
    if (src[state.pos] != "\n")
        return
    let n_newline = 0
    let i = state.pos
    for (; i < state.end; i++) {
        if (!(/[\s\n]/.test(src[i]))) {
            break
        }
        else {
            if (src[i] == "\n")
                n_newline++
        }
    }
    // Add a new line
    if (n_newline >= 2)
        state.push_node("sep")
    state.pos = i

}

export var valid_identifier_name_char = /[a-zA-Z0-9._]/

export function is_valid_identifier(src: string): boolean {
    return /^[a-zA-Z0-9._]+$/.test(src)
}

export function parse_identifier(src: string, state: parse_state): string {
    let start = state.pos
    let i = start
    for (; i < state.end; i++) {
        if (!valid_identifier_name_char.test(src[i])) {
            break
        }
    }
    let identifier_name = src.slice(start, i)
    state.pos = i
    return identifier_name
}

export class parse_state {
    // Configs used for parse and tokenize.
    public config = {}
    public ref_table: Record<string, parse_node> = {}
    public cmd_exec_state: cmd_exec_state
    public pos = 0
    public start = 0
    public end = -1
    public curr_node: parse_node
    public root_node: parse_node
    public constructor(src: string, emconfig: any) {
        this.end = src.length
        // Load the global config
        Object.assign(this.config, emconfig)
        this.curr_node = new parse_node("root")
        this.root_node = this.curr_node
        this.cmd_exec_state = new cmd_exec_state()
    }
    public assign_to_config(config: any, namespace: string) {
        if (namespace === null) {
            Object.assign(this.config, config)
        }
        else {
            Object.assign(this.config[namespace], config)
        }
    }
    public push_node(type: string): parse_node {
        return this.curr_node.push_child(type)
    }
    public push_warning_node(message: string): parse_node {
        let node = this.push_node("warning")
        node.content = message
        return node
    }
    public push_warning_node_to_root(message: string): parse_node {
        let node = this.root_node.push_child("warning")
        node.content = message
        return node
    }
    public pop_curr_node() {
        this.curr_node = this.curr_node.parent
    }
    public set_local_state(pos: number, start: number, end: number, curr_node: parse_node) {
        let saved = [this.pos, this.start, this.end, this.curr_node]
        this.pos = pos
        this.start = start
        this.end = end
        this.curr_node = curr_node
        return saved
    }
    public restore_state(save_state: any[]) {
        this.pos = save_state[0]
        this.start = save_state[1]
        this.end = save_state[2]
        this.curr_node = save_state[3]
    }
    public slice_range(src: string): string {
        return src.slice(this.start, this.end)
    }
    public slice_remaining(src: string): string {
        return src.slice(this.pos, this.end)
    }
}

export class parse_node {
    public children: parse_node[] = []
    public parent: parse_node
    public namespaec: string = ""
    public delim: number[] = [-1, -1]
    public type: string
    public content: string = ""
    public content_obj: any = {}
    public meta: any = {}
    public constructor(type: string) {
        this.type = type
    }
    public write: () => string = () => {
        return (this.type + " " + this.content).replaceAll("\n", "\\n")
    }
    private write_tree_with_level(level: number): string {
        let indent = " ".repeat(2 * level)
        let res = []
        res.push(indent)
        res.push(this.write())
        res.push("\n")
        for (let child of this.children) {
            res.push(child.write_tree_with_level(level + 1))
        }
        return res.join("")
    }
    public write_tree(): string {
        return this.write_tree_with_level(0)
    }
    public push_child(type: string): parse_node {
        let node = new parse_node(type)
        this.add_child(node)
        return node
    }
    public add_child(node: parse_node): parse_node {
        this.children.push(node)
        node.parent = this
        return node
    }
}

export type func_parser = (src: string, state: parse_state, parser: evomark_parser) => void

export class func_rule {
    public parse: func_parser
    public name: string
    public constructor(name: string, parse: func_parser) {
        this.name = name
        this.parse = parse
    }
}

export class cmd_rule {
    public parse: func_parser
    public name: string
    public constructor(name: string, parse: func_parser) {
        this.name = name
        this.parse = parse
    }
}