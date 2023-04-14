import { evomark_parser, parse_node } from "./parse"
import { evomark_tokenizer } from "./tokenize"
import * as fs from 'fs'
import { evomark_core } from "./core"
import { make_default_core } from "./default"
let parser = new evomark_parser()
let src: string = fs.readFileSync("../test/example.em", { encoding: 'utf8' })
let core = make_default_core()
let [root, parse_state] = core.parser.parse(src, null)


//console.log(root)
function get_indent(indent: number): string {
    return " ".repeat(indent)
}

function push_with_indent(content: string, res: string[], indent: number) {
    res.push("  ".repeat(indent) + content)
}

function new_line_between_node(node1: parse_node, node2: parse_node, cl_pos: number[]): boolean {
    if (!node2)
        return false
    let end1 = node1.delim[1]
    let start2 = node2.delim[0]
    let end_line1 = get_line_num(end1, cl_pos)
    let start_line2 = get_line_num(start2, cl_pos)
    return end_line1 != start_line2
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
            case "func": {
                push_with_indent("#" + node.content, res, indent)
                stringify_core(node, indent, res, cl_pos)
                if (new_line_between_pos(node.delim[1], root.children[i + 1]?.delim[0], cl_pos)) {
                    push_with_indent("\n", res, indent)
                }
                break
            }
            case "func_body": {
                push_with_indent("{", res, 0)
                if (new_line_between_pos(node.delim[0] - 1, node.children[0]?.delim[0], cl_pos)) {
                    push_with_indent("\n", res, 0)
                    stringify_core(node, indent + 1, res, cl_pos)
                }
                else {
                    stringify_core(node, indent, res, cl_pos)
                }
                push_with_indent("}", res, indent)

                let next_start = get_next_start(root, i)

                if (new_line_between_pos(node.delim[1], next_start, cl_pos)) {
                    push_with_indent("\n", res, 0)
                }
                break
            }
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
            case "text": {
                push_with_indent(node.content, res, indent)
                if (new_line_between_pos(node.delim[1], root.children[i + 1]?.delim[0], cl_pos)) {
                    push_with_indent("\n", res, indent)
                }
                break
            }
            case "sep": {
                push_with_indent("\n", res, 0)
                break
            }
            case "hidden_literal": {
                let splitted = node.content.split("\n")
                for (let j = 0; j < splitted.length - 1; j++) {
                    push_with_indent(splitted[j].trim(), res, indent)
                    push_with_indent("\n", res, indent)
                }
                push_with_indent(splitted[splitted.length - 1].trim(), res, indent)
                let next_start = get_next_start(root, i)
                if (new_line_between_pos(node.delim[1], next_start, cl_pos)) {
                    push_with_indent("\n", res, 0)
                }
                break
            }
        }
    }
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

function stringify(root) {
    let cl_pos = get_change_line_pos(src)
    let res = []
    stringify_core(root, 0, res, cl_pos)
    return res.join("")
}

console.log(stringify(root))