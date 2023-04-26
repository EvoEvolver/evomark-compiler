import { parse_node } from "../parse";
import { hash as spark_hash } from "spark-md5"
let type_of_cmd = ["var_use", "cmd", "var_assign"]
export type exec_pos = [curr_node: parse_node, index_stack: number[]]


export function move_to_next_cmd(pos: exec_pos): boolean {
    let stack_top = pos[1].length - 1
    let curr_node = pos[0]
    for (let i = pos[1][stack_top]; i < pos[0].children.length; i++) {
        // get next by DFS
        let child = pos[0].children[i]
        // Return if the child is a cmd
        if (type_of_cmd.indexOf(child.type) > -1) {
            pos[1][stack_top] = i
            return true
        }
        // If not a cmd, check whether the node has children
        else if (child.children.length > 0) {
            pos[0] = child
            pos[1].push(0)
            let next = move_to_next_cmd(pos)
            if (next != false)
                return true
            else {
                // If no cmd found, restore the original state
                pos[1].pop()
                pos[0] = curr_node
            }
        }
    }
    return false
}


export function get_cmd_list(root: parse_node): parse_node[] {
    let pos: exec_pos = [root, [0]]
    let cmd_list = []
    while (true) {
        let cmd = move_to_next_cmd(pos)
        if (cmd) {
            let stack_top = pos[1].length - 1
            let children_index = pos[1][stack_top]
            cmd_list.push(pos[0].children[children_index])
            pos[1][stack_top] += 1
        }
        else {
            break
        }
    }
    return cmd_list
}

export type exec_rule = (cmd_node: parse_node, state: exec_state, assigned: obj_host) => void

export class evomark_exec {
    public exec_rules = {}
    public add_rule(name: string, rule_func) {
        if (name in this.exec_rules)
            throw Error("Rule with name " + name + " already in rules")
        this.exec_rules[name] = rule_func
    }
    public exec(root: parse_node, cache_table: any): exec_state {
        let state = new exec_state(cache_table)
        let cmd_list = get_cmd_list(root)
        for (let cmd of cmd_list) {
            switch (cmd.type) {
                case "var_use": {
                    break
                }
                case "var_assign": {
                    let cmd_node = cmd.children[0]
                    let rule = this.exec_rules[cmd_node.content]
                    if (!rule)
                        throw Error("Cannot find rule " + cmd.children[0].content)
                    let var_host = new obj_host()
                    rule(cmd_node, state, var_host)
                    state.host_map[cmd.content] = var_host
                    break
                }
                case "cmd": {
                    let rule = this.exec_rules[cmd.content]
                    if (!rule)
                        throw Error("Cannot find rule " + cmd.children[0].content)
                    rule(cmd, state, null)
                    break
                }
                default:
                    throw Error("bug found")
            }
        }
        return state
    }
}


export class exec_state {
    // ID to obj map
    // Store all the cached objects
    // May be read from file. May be saved as cache
    public cache_table: any
    // Name to var_host map
    public host_map: Record<string, obj_host> = {}
    // A rule function might turn this to true and the execution should halt
    public halt_flag = false
    public constructor(cache_table: any) {
        if (cache_table != null)
            this.cache_table = cache_table
        else
            this.cache_table = {}
    }
    public get_obj_host(var_use_node: parse_node): obj_host {
        let var_name = var_use_node.content
        if (var_name in this.host_map) {
            return this.host_map[var_name]
        }
        else {
            return null
        }
    }
    public read_cache(hash: string): any {
        return this.cache_table[hash]
    }
    public save_cache(hash: string, content: any) {
        this.cache_table[hash] = content
    }
}

export function get_next_sibling(node: parse_node) {

}


export function get_hash(input: string, caller: string) {
    return spark_hash([caller, "$", input].join(""))
}

export enum host_type {
    Undef,
    Lazy, // In this case, the content of the host is the input hash
    InDoc,  // Normal case. The content is deduced from the document
}

export class obj_host {
    public type: host_type = host_type.Undef
    // Content for lazy obj
    public input_hash = null
    public input: any = null
    public eval_func: (input: any) => any = null
    private _content: any = "<Undef>"
    public dependency: obj_host[] = []
    public content(): any {
        return this._content
    }
    public set_content(content: any) {
        this._content = content
    }
}