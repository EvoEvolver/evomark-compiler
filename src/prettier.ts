import {parse_node} from "./parse"
import * as JSON5 from "JSON5"

function push_with_indent(content: string, res: string[], indent: number) {
    res.push("    ".repeat(indent) + content)
}

function push_multi_line_literal(content: string, res: string[], indent: number) {
    let splitted = content.split("\n")
    push_with_indent(splitted[0], res, 0)
    for (let i = 1; i < splitted.length; i++) {
        res.push("\n")
        push_with_indent(splitted[i], res, indent)
    }
}

function stringify_children(root: parse_node, indent: number, res: string[]) {
    for (let i = 0; i < root.children.length; i++) {
        let node = root.children[i]
        if(node.is_dynamic)
            continue
        switch (node.type) {
            case "text":
            case "literal": {
                if (node.content) {
                    add_space_for_inline(res)
                    push_multi_line_literal(node.content, res, indent)
                }
                break
            }
            case "cmd":
            case "func": {
                let starter = "#"
                if (node.type == "cmd") starter = "$"
                push_with_indent(starter + node.content, res, 0)
                stringify_children(node, indent, res)
                break
            }
            case "body": {
                switch (node.typesetting_type) {
                    case "inline":
                        push_with_indent("{", res, 0)
                        stringify_children(node, 0, res)
                        push_with_indent("}", res, 0)
                        break
                    default:
                    case "block":
                        if (get_last_char(res) == "\n")
                            push_with_indent("{\n", res, indent)
                        else
                            push_with_indent("{\n", res, 0)
                        push_with_indent("", res, indent + 1)
                        stringify_children(node, indent + 1, res)
                        push_with_indent("\n", res, indent)
                        push_with_indent("}", res, indent)
                        break
                    case "direct_child":
                        let direct_child_node = node.children[0]
                        if (direct_child_node.type == "cmd")
                            push_with_indent("$", res, 0)
                        else
                            push_with_indent("#", res, 0)
                        push_with_indent(direct_child_node.content, res, 0)
                        stringify_children(direct_child_node, indent, res)
                        break
                    case "code":
                        let [start_len, end_len] = node.meta["_delim"]
                        let starter = "=".repeat(start_len) + ">"
                        let ender = "=".repeat(end_len) + "|"
                        if (get_last_char(res) == "\n")
                            push_with_indent(starter + "\n", res, indent)
                        else
                            push_with_indent(starter + "\n", res, 0)
                        push_with_indent("", res, indent + 1)
                        stringify_children(node, indent + 1, res)
                        push_with_indent("\n", res, indent)
                        push_with_indent("\n" + ender, res, indent)
                        break
                }

                break
            }
            case "param": {
                res.push("(")
                res.push(JSON5.stringify(node.content_obj))
                res.push(")")
                break
            }
            case "ref": {
                push_with_indent("@" + node.content + "=\n", res, indent)
                stringify_children(node, indent, res)
                break
            }
            case "var_assign": {
                if (node.typesetting_type == "one_line")
                    push_with_indent("%" + node.content + " = ", res, 0)
                else if (node.typesetting_type == "two_line")
                    push_with_indent("%" + node.content + "=\n", res, indent)
                else
                    push_with_indent("%" + node.content + "=\n", res, 0)
                stringify_children(node, indent, res)
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
                } else {
                    push_with_indent("\n".repeat(node.content_obj), res, 0)
                    push_with_indent("", res, indent)
                }

                break
            }
            case "fragment": {
                stringify_children(node, indent, res)
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
    let res = []
    stringify_children(root, 0, res)
    return res.join("")
}