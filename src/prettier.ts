import { evomark_parser, parse_node } from "./parse"
import { evomark_tokenizer } from "./tokenize"
import * as fs from 'fs'
import { evomark_core } from "./core"
import { make_default_core } from "./default"
let parser = new evomark_parser()
var args = process.argv.slice(2);
let file_path = args[0]
let src: string = fs.readFileSync(file_path, { encoding: 'utf8' })
let core = make_default_core()
let [root, parse_state] = core.parser.parse(src, null)

function push_with_indent(content: string, res: string[], indent: number) {
    res.push("  ".repeat(indent) + content)
}

function push_multi_line_literal(content: string, res: string[], indent: number) {
    let splitted = content.split("\n")
    push_with_indent(splitted[0], res, 0)
    for (let i = 1; i < splitted.length; i++) {
        res.push("\n")
        push_with_indent(splitted[i], res, indent)
    }
}

function new_line_between_pos(pos1: number, pos2: number, cl_pos: number[]): boolean {
    if (pos2 === undefined)
        return false
    let end_line1 = get_line_num(pos1, cl_pos)
    let start_line2 = get_line_num(pos2, cl_pos)
    return end_line1 != start_line2
}

function get_next_start(root: parse_node, cuur_i: number) {
    let next_start: number
    if (root.children[cuur_i + 1]) {
        if (root.children[cuur_i + 1].type === "func_body") {
            next_start = root.children[cuur_i + 1].delim[0] - 1
        }
        else {
            next_start = root.children[cuur_i + 1].delim[0]
        }
    }
    else {
        next_start = root.delim[1]
    }
    return next_start
}

function stringify_core(root: parse_node, indent: number, res: string[], cl_pos: number[]) {
    for (let i = 0; i < root.children.length; i++) {
        let node = root.children[i]
        switch (node.type) {
            case "cmd":
            case "func": {
                let starter = "#"
                if (node.type == "cmd") starter = "$"
                push_with_indent(starter + node.content, res, indent)
                stringify_core(node, indent, res, cl_pos)
                break
            }
            case "cmd_body":
            case "func_body": {
                switch (node.typesetting_type) {
                    case "inline":
                        push_with_indent("{", res, 0)
                        stringify_core(node, 0, res, cl_pos)
                        push_with_indent("}", res, 0)
                        break
                    default:
                    case "block":
                        if (get_last_char(res) == "\n")
                            push_with_indent("{\n", res, indent)
                        else
                            push_with_indent("{\n", res, 0)
                        push_with_indent("", res, indent + 1)
                        stringify_core(node, indent + 1, res, cl_pos)
                        push_with_indent("\n", res, indent)
                        push_with_indent("}\n", res, indent)
                        break
                    case "direct_child":
                        let func_node = node.children[0]
                        if (node.type == "cmd_body")
                            push_with_indent("$", res, 0)
                        else
                            push_with_indent("#", res, 0)
                        push_with_indent(func_node.content, res, 0)
                        stringify_core(func_node, indent + 1, res, cl_pos)
                        break
                }

                break
            }
            case "cmd_param":
            case "func_param": {
                res.push("(")
                res.push(JSON.stringify(node.content_obj))
                res.push(")")
                break
            }
            case "ref": {
                push_with_indent("@" + node.content + "=\n", res, indent)
                stringify_core(node, indent, res, cl_pos)
                break
            }
            case "var_assign": {
                if (node.typesetting_type == "one_line")
                    push_with_indent("%" + node.content + " = ", res, indent)
                else if (node.typesetting_type == "two_line")
                    push_with_indent("%" + node.content + "=\n", res, indent)
                else
                    push_with_indent("%" + node.content + "=\n", res, indent)
                stringify_core(node, indent, res, cl_pos)
                break
            }
            case "var_use": {
                add_space_for_inline(res)
                push_with_indent("%" + node.content, res, 0)
                break
            }
            case "sep": {
                if (get_last_char(res) == "\n") {
                    push_with_indent("\n".repeat(1), res, 0)
                    push_with_indent("", res, indent)
                }
                else {
                    push_with_indent("\n".repeat(node.content_obj), res, 0)
                    push_with_indent("", res, indent)
                }

                break
            }
            case "text":
            case "literal": {
                if (node.content != "") {
                    add_space_for_inline(res)
                    push_multi_line_literal(node.content, res, indent)
                }
                break
            }
        }
    }
}

function get_last_char(res: string[]) {
    let i = res.length
    if (i == 0)
        return ""
    i = i - 1
    // Skip empty
    while (res[i] == "" && i > 0) {
        i--
    }
    return res[i].slice(-1)
}

function add_space_for_inline(res: string[]) {
    if (" \n{".indexOf(get_last_char(res)) > -1)
        return
    else
        res.push(" ")
}


function get_change_line_pos(src: string): number[] {
    let cl_pos = [0]
    for (let i = 0; i < src.length; i++) {
        if (src.charAt(i) == "\n") {
            cl_pos.push(i)
        }
    }
    cl_pos.push(src.length)
    return cl_pos
}

function get_line_num(pos: number, cl_pos: number[]) {
    if (pos > cl_pos[cl_pos.length - 1])
        return cl_pos.length - 1
    let start = 0;
    let end = cl_pos.length - 1;
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        if (cl_pos[mid] <= pos && pos < cl_pos[mid + 1]) {
            return mid;
        }
        if (pos < cl_pos[mid]) {
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }
    return -1;
}

export function stringify(root: parse_node) {
    let cl_pos = get_change_line_pos(src)
    let res = []
    stringify_core(root, 0, res, cl_pos)
    return res.join("")
}