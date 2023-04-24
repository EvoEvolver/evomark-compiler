import { parse_node } from "../parse";

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


export function get_cmd_list(root: parse_node) {
    let pos: exec_pos = [root, [0]]
    let cmd_list = []
    while (true) {
        let cmd = move_to_next_cmd(pos)
        if (cmd) {
            let stack_top = pos[1].length - 1
            cmd_list.push(pos[0].children[pos[1][stack_top]])
            pos[1][stack_top] += 1
        }
        else {
            break
        }
    }
    return cmd_list
}

class executor{
    public exec_rules = {}
}