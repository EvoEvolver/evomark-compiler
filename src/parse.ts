

import { parse_func_body, parse_func_param, parse_func_name, valid_func_name_char } from "./parse_func"

export class evomark_parser {

    public parse_rules_func: Record<string, parse_rule_func>

    public init_state_config = {}

    public constructor() {
        this.parse_rules_func = {}
        this.add_func_rule(new parse_rule_func("box", parse_box))
    }

    public add_func_rule(rule: parse_rule_func) {
        if (rule.name in this.parse_rules_func)
            throw Error("Trying to add a rule of the same name")
        this.parse_rules_func[rule.name] = rule
    }

    public parse_func(src: string, state: parse_state): boolean {
        let start = state.pos

        if (start == state.end - 1) {
            return false
        }

        if (src[start] != "#" || !valid_func_name_char.test(src[start + 1])) {
            return false
        }

        state.pos++
        let func_name = parse_func_name(src, state)

        // TODO look up func_name table
        let rule = this.parse_rules_func[func_name]
        if (!rule) {
            console.log("Cannot find rule name " + func_name)
            rule = this.parse_rules_func["box"]
        }

        let node = state.push_node("func")
        node.content = func_name
        state.curr_node = node

        while (true) {
            let param = parse_func_param(src, state)
            let body_node = parse_func_body(src, state)
            if ((!param) && (!body_node)) {
                break
            }
            if (body_node) {
                let [body_start, body_end] = body_node.delim
                let saved = state.set_local_state(body_start, body_start, body_end, body_node)
                rule.parse(src, state, param, this)
                state.restore_state(saved)
            }
        }

        state.curr_node = state.curr_node.parent

        return true
    }

    public parse_inline(src: string, state: parse_state): boolean {
        let start = state.pos

        let i = start

        for (; i < state.end; i++) {
            if ((/[#]/).test(src[i])) {
                break
            }
            if ((/[\n]/).test(src[i])) {
                if (i + 1 < state.end && (/[\n]/).test(src[i + 1])) {
                    i++
                    break
                }
            }

        }

        let succ = i != start
        if (succ) {
            let node = state.push_node("text")
            node.content = src.slice(start, i)
            state.pos = i
        }

        return succ

    }

    public parse_core(src: string, state: parse_state): boolean {
        while (state.pos != state.end) {
            // Merge multiple \n
            if (src[state.pos] == "\n") {
                state.pos++
                continue
            }
            // Try rules
            if (this.parse_inline(src, state))
                continue
            if (this.parse_func(src, state))
                continue
            console.log("There is no available rules. Abort.")
            return false
        }
        return true
    }

    public parse(src: string): parse_node {
        let state = new parse_state(src)
        state.config = this.init_state_config
        this.parse_core(src, state)
        return state.root_node
    }
}

export class parse_state {
    public config = {}
    public pos = 0
    public start = 0
    public end = -1
    public curr_node: parse_node
    public root_node: parse_node
    public constructor(src: string) {
        this.end = src.length
        this.curr_node = new parse_node("root")
        this.root_node = this.curr_node
    }
    public push_node(type: string): parse_node {
        let node = new parse_node(type)
        this.curr_node.children.push(node)
        node.parent = this.curr_node
        return node
    }
    public push_warning_node(message: string): parse_node {
        let node = this.push_node("warning")
        node.content = message
        return node
    }
    public push_error_node(content: string): parse_node {
        let node = new parse_node("error")
        this.curr_node.children.push(node)
        node.content = content
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
    public slice_range(src: string): string{
        return src.slice(this.start, this.end)
    }
    public slice_remaining(src: string): string{
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
}

type func_parser = (src: string, state: parse_state, param: any, parser: evomark_parser) => boolean

export class parse_rule_func {
    public parse: func_parser
    public name: string
    public constructor(name: string, parse: func_parser) {
        this.name = name
        this.parse = parse
    }
}

function parse_box(src: string, state: parse_state, param: any, parser: evomark_parser): boolean {
    return parser.parse_core(src, state)
}
