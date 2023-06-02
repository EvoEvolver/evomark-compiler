import {parse_node} from "../parse";
import {hash as spark_hash} from "spark-md5"
import {normalize_text} from "../utils/normalize";
import {evomark_core, proc_state} from "../core";
import * as util from "util";
import {isStringObject} from "util/types";
import {isString} from "util";

let type_of_exec = ["var_use", "cmd", "var_assign"]

function get_exec_list_for_node(node: parse_node, exec_list: parse_node[]): void {
    for (let child of node.children) {
        let idx = type_of_exec.indexOf(child.type)
        if (idx > -1) {
            // If child is a cmd or var_assign
            if(idx >= 1){
                if(child.meta.exclaim === 2){
                    child.remove_self_from_parent()
                    continue
                }
            }
            exec_list.push(child)
            continue
        }
        get_exec_list_for_node(child, exec_list)
    }
}

export function get_exec_list(root: parse_node): parse_node[] {
    let exec_list = []
    get_exec_list_for_node(root, exec_list)
    return exec_list
}

export type exec_rule = (cmd_node: parse_node, state: exec_state, assigned: obj_host) => void

export class evomark_exec {
    public exec_rules = {}
    public add_rule(name: string, rule_func) {
        if (name in this.exec_rules)
            throw Error("Rule with name " + name + " already in rules")
        this.exec_rules[name] = rule_func
    }

    public async exec_cmd(cmd: parse_node, state: exec_state, core: evomark_core, proc_state: proc_state){
        let rule = this.exec_rules[cmd.content]
        if (!rule)
            throw Error("Cannot find rule " + cmd.content)
        let return_value
        if (util.types.isAsyncFunction(rule))
            return_value = await rule(cmd, state, null, core, proc_state)
        else
            return_value = rule(cmd, state, null, core, proc_state)

        // There is warning added. We must process
        if (state.warning_list.length != 0) {
            let message = state.warning_list.join("\n")
            cmd.add_sibling(new parse_node("cmd"))
                .set_content("!!warning")
                .push_child("body")
                .push_child("literal")
                .set_content(message)
            cmd.add_sibling(new parse_node("sep")).set_content_obj(1)
            state.warning_list = []
        }

        if (cmd.meta.exclaim == 1) {
            cmd.remove_self_from_parent()
        }
        return return_value
    }

    public async exec(root: parse_node, ctx: any, core: evomark_core, proc_state: proc_state): Promise<exec_state> {
        let state = new exec_state(ctx || {})
        let exec_list = get_exec_list(root)
        for (let exec_node of exec_list) {
            switch (exec_node.type) {
                case "var_use": {
                    let host = state.node_to_obj_host(exec_node)
                    if (host == null)
                        throw Error("Undefined variable %" + exec_node.content)
                    exec_node.add_sibling(new parse_node("literal")).set_content(await host.get_text(state)).make_dynamic()
                    break
                }
                case "var_assign": {
                    let cmd_node = exec_node.children[0]
                    let var_host
                    var_host = await this.exec_cmd(cmd_node, state, core, proc_state)
                    if(var_host == null){
                        var_host = new obj_host()
                    }
                    else{
                        var_host.var_name = exec_node.content
                    }
                    state.last_var_assign = var_host
                    state.host_map[exec_node.content] = var_host
                    break
                }
                case "cmd": {
                    await this.exec_cmd(exec_node, state, core, proc_state)
                    break
                }
                default:
                    throw Error("bug found")
            }
            if (state.halt_flag) {
                exec_node.add_sibling(new parse_node("cmd")).set_content("!!halted_here")
                exec_node.add_sibling(new parse_node("sep")).set_content_obj(1)
                break
            }
            state.exec_pos++
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
    public last_var_assign: obj_host = null
    public warning_list: string[] = []
    // A number that is different for each cmd in execution
    // Designed for cache salt
    public exec_pos: number = 0

    public constructor(ctx: any) {
        this.cache_table = ctx["cache"] || {}
    }

    public get_ctx() {
        return {
            "cache": this.cache_table
        }
    }


    public node_to_obj_host(var_use_node: parse_node): obj_host {
        let var_name = var_use_node.content
        return this.name_to_obj_host(var_name)
    }

    public name_to_obj_host(var_name: string): obj_host {
        if (var_name in this.host_map) {
            return this.host_map[var_name]
        } else {
            return null
        }
    }

    public read_cache(hash: string): any {
        return this.cache_table[hash]
    }

    public save_cache(hash: string, content: cnt) {
        this.cache_table[hash] = content
    }

    public add_warning(message: string) {
        this.warning_list.push(message)
    }

    public add_fatal(message: string) {
        this.warning_list.push(message)
        this.halt_flag = true
    }
}


export function get_hash(input: any, caller_salt: string) {
    return spark_hash([caller_salt, "$", JSON.stringify(input)].join(""))
}

export enum host_type {
    Undef,
    Lazy, // In this case, the content of the host is the input hash
    InDoc,  // Normal case. The content is deduced from the document
    Saved
}

export type cnt = obj | string

export class obj{
    public type: string
    public content: any
    public constructor(type, content){
        this.type = type
        this.content = content
    }
}

export class obj_host {
    public defined: boolean = false
    public var_name: string = null
    // Content for cached object
    public use_cache: boolean = false
    public input_hash = null
    public input: any = null
    public eval_func: (input: any) => Promise<cnt> = null

    // Revisable
    public can_revise: boolean = false

    public dependency: obj_host[] = []

    private _content: cnt = null

    public constructor() {
    }

    public async get_content(state: exec_state): Promise<cnt> {
        if (this._content == null) {
            if (this.use_cache) {
                let res = await eval_and_cache(this, state.cache_table)
                if (res == null) {
                    this._content = null
                }
                else {
                    this._content = res
                }
                return this._content
            }
            return null
        } else
            return this._content
    }

    public async get_text(state: exec_state): Promise<string> {
        let cnt = await this.get_content(state)
        if(typeof cnt === 'string')
            return cnt
        switch (cnt.type) {
            case "str": {
                return cnt.content
            }
            default:
                throw Error("Not finished yet")
        }
    }

    public set_content(content: cnt) {
        if (content != null)
            this.defined = true
        this._content = content
    }
}

export async function eval_without_cache(host: obj_host): Promise<cnt> {
    return await host.eval_func(host.input)
}


export async function eval_and_cache(host: obj_host, cache_table: any): Promise<cnt> {
    let cached = cache_table[host.input_hash]
    if (cached != undefined)
        return cached
    let res = await host.eval_func(host.input)
    cache_table[host.input_hash] = res
    host.set_content(res)
    return res
}

export async function eval_to_text(nodes: parse_node[], state: exec_state): Promise<{text: string, dependency: obj_host[]}>{
    let dependency: obj_host[] = []
    let undef = []
    for (let node of nodes) {
        if (node.type == "var_use") {
            let var_host = state.node_to_obj_host(node)
            if (var_host != null) {
                dependency.push(var_host)
                if (!var_host.defined) {
                    undef.push(node.content)
                    continue
                }
                if (await var_host.get_content(state) == null) {
                    undef.push(node.content)
                    continue
                }
            } else {
                undef.push(node.content)
                dependency.push(null)
            }

        }
    }
    let res: string[] = []
    let i_var = 0
    for (let node of nodes) {
        if (node.type == "var_use") {
            let var_host = dependency[i_var]
            if (var_host != null) {
                let content = await var_host.get_content(state)
                res.push(content + " ")
            } else
                res.push("*Error*")
            i_var++
        } else if (node.type == "literal") {
            res.push(node.content + " ")
        } else if (node.type == "sep") {
            res.push("\n".repeat(node.content_obj))
        }
    }

    if (undef.length > 0) {
        for (let name of undef) {
            state.add_warning("Variable \"" + name + "\" is not defined")
        }
        return {
            text: null,
            dependency
        }
    }


    let text = normalize_text(res.join(""))

    return {
        text,
        dependency
    }
}