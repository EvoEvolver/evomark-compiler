import { parse_node } from "./parse"


export class cmd_exec_state {
    public var_table: Record<string, parse_node> = {}
    public cache_table: Record<string, any> = {}
    public constructor() {

    }
    public add_var(var_node: parse_node) {
        this.var_table[var_node.content] = var_node
    }
    public add_cache(input_hash: string, result: any) {
        this.cache_table[input_hash] = result
    }
    public read_cache(input_hash: string){
        return this.cache_table[input_hash] || null
    }
    public get_content_by_id(id: string) {
        let var_node = this.var_table[id]
        if ((!var_node) || (!var_node.content_obj))
            return null
        return var_node.content_obj["result"]
    }
}