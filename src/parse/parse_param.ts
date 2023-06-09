import {parse_node, parse_state} from "./index";
import {find_next_pairing_ignore_quote} from "./utils";
import {parse_cmd_var_name} from "./parse_cmd";
import {stat} from "fs";

export function parse_param(src: string, state: parse_state): parse_node {
    let start = state.pos
    if (src[start] == "\n")
        start++
    if (src[start] != "(")
        return null
    let next = find_next_pairing_ignore_quote("(", ")", src, start + 1)
    if (next == -1)
        return null
    let param_src = src.slice(start + 1, next)
    let end = state.end
    state.end = next
    state.pos ++
    let node = parse_param_with_src(src, state)
    // Make it after the parenthesis
    state.pos = next + 1
    state.end = end
    return node
}

type param_object = {
    args: any[],
    //kwarg: string,
}

type param_cmd_var = {
    cmd_var_name: string
}


function parse_param_with_src(src: string, state: parse_state): parse_node{
    let node = state.push_node("param")
    let objects = []
    let want_obj = true
    while(state.pos < state.end){
        let obj
        let char = src[state.pos]
        switch(char){
            // white space
            case " ":
                state.pos ++
                continue
            case ",":
                state.pos ++
                if(want_obj){
                    state.push_warning_node("Error in param")
                    return null
                }
                want_obj = true
                continue
            // string
            case "\"":
                state.pos ++
                obj = parse_string(src, state)
                break
            // array
            case "[":
                // Not implemented error
                throw new Error("Not implemented")
                break
            // cmd variable
            case "%":
                let var_name = parse_cmd_var(src, state)
                if(var_name!=null){
                    obj = {
                        cmd_var_name : var_name
                    }
                }
                break
            default:
                // If the first char is number (use regex)
                // literal number
                if(char.match(/[0-9]/)){
                    obj = parse_number(src, state)
                }
                // If the first char is letter (use regex)
                else if(char.match(/[a-zA-Z]/)){
                    throw new Error("Not implemented")
                }
        }
        if(obj===null){
            state.push_warning_node("Error in param")
            return null
        }
        objects.push(obj)
        want_obj = false
        //state.pos ++
    }
    node.content_obj = {
        args: objects,
    }
    return node
}


function parse_cmd_var(src: string, state: parse_state): string{
    return parse_cmd_var_name(src, state)
}

function parse_string(src: string, state: parse_state): string{
    let start = state.pos
    // Find next quote
    let next = -1
    for(let i=start; i<state.end; i++){
        if(src[i]=="\""){
            next = i
            break
        }
    }
    if(next==-1)
        return null
    state.pos = next+1
    return src.slice(start, next)
}

function parse_number(src: string, state: parse_state): number{
    let start = state.pos
    let had_point = false
    let i = start
    for(; i<src.length; i++){
        if(src[i]==".") {
            if (had_point){
                state.push_warning_node("Invalid number in param")
                return null
            }
            else
                had_point = true
        }
        else if(!src[i].match(/[0-9]/))
            break
    }
    let num
    if(had_point)
        num = parseFloat(src.slice(start, i))
    else
        num = parseInt(src.slice(start, i))
    state.pos = i
    return num
}