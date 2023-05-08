import {parse_cmd, parse_cmd_var} from "./parse_cmd"
import {parse_func} from "./parse_func"
import {parse_ref_assign} from "./parse_ref"
import {parse_normal_breaking_literal} from "./parse_text"
import {simple_parser} from "./common"

export const default_core_rules = [parse_normal_breaking_literal, parse_cmd, parse_cmd_var, parse_func, parse_ref_assign]

export class evomark_parser {

    public func_rules: Record<string, func_parser>
    public cmd_rules: Record<string, func_parser>

    public constructor() {
        this.func_rules = {}
        this.cmd_rules = {}
        this.add_func_rule("box", simple_parser)
    }

    public init_state_config = () => {
        return {}
    }

    public add_func_rule(name: string, rule: func_parser) {
        if (name in this.func_rules)
            throw Error("Trying to add a rule of the same name: " + name)
        this.func_rules[name] = rule
    }

    public add_cmd_rule(name: string, rule: func_parser) {
        if (name in this.func_rules)
            throw Error("Trying to add a rule of the same name: " + name)
        this.cmd_rules[name] = rule
    }

    public parse_core(src: string, state: parse_state): boolean {
        return parse_core_with_rules(src, state, default_core_rules, this)
    }

    public parse(src: string, config: any): [parse_node, parse_state] {
        let state = new parse_state(src, config)
        state.config = this.init_state_config()
        this.parse_core(src, state)
        return [state.root_node, state]
    }
}

export function parse_core_with_rules(src: string, state: parse_state, rules, parser: evomark_parser): boolean {
    while (state.pos != state.end) {
        // Try rules
        let succ = false
        for (let rule of rules) {
            if (rule(src, state, parser)){
                succ = true
                break
            }
        }
        if (succ)
            continue
        if (state.pos == state.end)
            break
        console.log("There is no available rules. Abort.")
        return false
    }
    return true
}


export var valid_identifier_name_char = /[a-zA-Z0-9_]/

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
    public pos = 0
    public start = 0
    public end = -1
    public curr_node: parse_node
    public root_node: parse_node

    public constructor(src: string, config: any) {
        this.end = src.length
        // Load the global config
        Object.assign(this.config, config)
        this.curr_node = new parse_node("root")
        this.root_node = this.curr_node
    }

    public assign_to_config(config: any, namespace: string) {
        if (namespace === null) {
            Object.assign(this.config, config)
        } else {
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
    public namespace: string = ""
    public typesetting_type = ""
    public delim: number[] = [-1, -1]
    public type: string
    public content: string = ""
    public content_obj: any = null
    public meta: any = {}
    public is_garbage = false
    public is_dynamic = false

    public constructor(type: string) {
        this.type = type
    }

    public write: () => string = () => {
        return (this.type + " " + this.content).replaceAll("\n", "\\n")
    }

    public make_dynamic() {
        this.is_dynamic = true
        return this
    }

    public set_content(content: string): parse_node {
        this.content = content
        return this
    }

    public set_content_obj(content_obj: any): parse_node {
        this.content_obj = content_obj
        return this
    }

    public set_typesetting_type(typesetting_type: string): parse_node {
        this.typesetting_type = typesetting_type
        return this
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

    public set_child_at(node: parse_node, idx: number): parse_node {
        this.children[idx] = node
        node.parent = this
        return node
    }

    public get_self_index() {
        let parent = this.parent
        return parent.children.findIndex((x) => x == this)
    }

    /**
     * @returns The first sibling that is not empty (e.g. sep)
     */
    public get_next_semantic_sibling() {
        let self_index = this.get_self_index()
        for (let i = self_index + 1; i < this.parent.children.length; i++) {
            if (this.parent.children[i].type == "sep")
                continue
            else
                return this.parent.children[i]
        }
        return null
    }

    public get_first_sementic_child() {
        for (let child of this.children) {
            if (child.type == "sep")
                continue
            else
                return child
        }
        return null
    }

    public remove_self_from_parent() {
        let self_index = this.get_self_index()
        this.parent.children.splice(self_index, 1)
    }

    public add_sibling(node: parse_node): parse_node {
        let self_index = this.get_self_index()
        this.parent.children.splice(self_index + 1, 0, node)
        node.parent = this.parent
        return node
    }

    public add_older_sibling(node: parse_node, with_sep?: boolean): parse_node {
        let self_index = this.get_self_index()
        if (with_sep === true) {
            let new_sep = new parse_node("sep").set_content_obj(2)
            this.parent.children.splice(self_index, 0, new_sep)
            new_sep.parent = this
        }
        this.parent.children.splice(self_index, 0, node)
        node.parent = this.parent
        return node
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
}

export type func_parser = (src: string, state: parse_state, parser: evomark_parser) => void
