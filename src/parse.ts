

import { parse_func, parse_func_body, parse_func_param } from "./parse_func"
import { parse_ref } from "./parse_ref"
import { simple_parser } from "./rules/common"


export class evomark_parser {

    public parse_rules_func: Record<string, parse_rule_func>

    public init_state_config = () => {
        return {}
    }

    public constructor() {
        this.parse_rules_func = {}
        this.add_func_rule(new parse_rule_func("box", simple_parser))
    }

    public add_func_rule(rule: parse_rule_func) {
        if (rule.name in this.parse_rules_func)
            throw Error("Trying to add a rule of the same name: " + rule.name)
        this.parse_rules_func[rule.name] = rule
    }

    public parse_text(src: string, state: parse_state): boolean {
        let start = state.pos

        let i = start
        let change_line_break = false
        let content: string

        for (; i < state.end; i++) {
            if ((/[#@$%]/).test(src[i])) {
                break
            }
            if ((/[\n]/).test(src[i])) {
                if (i + 1 < state.end && (/[\n]/).test(src[i + 1])) {
                    change_line_break = true
                    break
                }
            }
        }



        let succ = i != start
        if (succ) {
            let content = src.slice(start, i)
            if (content.length != 0) {
                let node = state.push_node("text")
                node.delim = [start, i]
                let trimed = content.replace(/^[ \t]+|[ \t]+$/g, '')
                if(trimed[trimed.length-1]!="\n")
                    trimed = trimed+" "
                if(content[0]==" ")
                    trimed = " "+trimed
                node.content = trimed
            }
            state.pos = i
        }
        return succ
    }

    public parse_ref_assign(src: string, state: parse_state): boolean {
        let ref_name = parse_ref(src, state)
        if (!ref_name)
            return false
        let start = state.pos
        let i = state.pos
        let found_equal = false
        for (; i < state.end; i++) {
            if (src[i] == "=") {
                found_equal = true
                i++
                break
            }
            else if (src[i] == " ") {
                continue
            }
            else {
                break
            }
        }
        if (found_equal) {
            let found_func = false
            for (; i < state.end; i++) {
                let a = src[i]
                if (" \n".indexOf(src[i]) > -1) {
                    continue
                }
                else if (src[i] == "#") {
                    found_func = true
                    break
                }
                else {
                    break
                }
            }
            state.pos = i
            if (found_func) {
                let ref_node = state.push_node("ref")
                ref_node.content = ref_name
                state.curr_node = ref_node
                let succ = parse_func(src, state, this)
                ref_node.delim = [start, state.pos]
                if (!succ) {
                    state.push_warning_node_to_root("\"@" + ref_name + " = \" must be followed with a function")
                }
                else {
                    // Add the ref to the ref_table
                    if (ref_name in state.ref_table) {
                        state.push_warning_node("Redefining " + ref_name + "!")
                    }
                    else {
                        state.ref_table[ref_name] = ref_node//.children[0]
                    }

                }
                state.curr_node = ref_node.parent
            }
            else {
                state.push_warning_node_to_root("\"@" + ref_name + " = \" must be followed with a function")
                return true
            }
        }
        else {
            state.push_warning_node_to_root("\"@" + ref_name + " = \" must be followed with a function")
        }
        return true
    }

    public parse_cmd_var(src: string, state: parse_state): boolean{
        return true
    }

    public parse_cmd(src: string, state: parse_state): boolean{
        

        return true
    }

    public parse_core(src: string, state: parse_state): boolean {
        while (state.pos != state.end) {
            // Merge multiple \n
            if (src[state.pos] == "\n") {
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
                continue
            }
            // Try rules
            if (this.parse_text(src, state))
                continue
            if (parse_func(src, state, this))
                continue
            if (this.parse_ref_assign(src, state))
                continue
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
    public pop_node() {
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
    public content_obj: any = null
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

export type func_parser = (src:string, state: parse_state, parser: evomark_parser) => void

export class parse_rule_func {
    public parse: func_parser
    public name: string
    public constructor(name: string, parse: func_parser) {
        this.name = name
        this.parse = parse
    }
}
