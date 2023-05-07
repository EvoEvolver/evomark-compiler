import {parse_node} from "../parser";


export function get_pure_texts(nodes: parse_node[]): string {
    let res = []
    for (let node of nodes) {
        switch (node.type) {
            case "literal": {
                res.push(node.content)
                break
            }
            case "var_use": {
                res.push(get_pure_texts(node.children))
                break
            }
            default: {
                // We ignore other cases
            }
        }
    }
    return res.join(" ")
}