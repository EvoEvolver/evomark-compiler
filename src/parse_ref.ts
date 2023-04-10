import { parse_identifier, parse_state } from "./parse";


export function parse_ref(src: string, state: parse_state): string {
    let start = state.pos
    if (src[start] != "@")
        return null
    state.pos++
    return parse_identifier(src, state)
}