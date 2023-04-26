import { evomark_parser, parse_node } from "../parse"
import * as fs from 'fs'
import { make_default_core } from "../default"
import { stringify } from "../prettier";
import { evomark_exec } from "../exec/exec";
let parser = new evomark_parser()
var args = process.argv.slice(2);
let file_path = args[0]
let src: string = fs.readFileSync(file_path, { encoding: 'utf8' })
let core = make_default_core()
let [root, parse_state] = core.parser.parse(src, null)
console.log(root.write_tree())
let cache_table: any
if (fs.existsSync(file_path + ".cache.json")) {
    cache_table = JSON.parse(fs.readFileSync(file_path + ".cache.json", { encoding: 'utf8' }))
}
else {
    cache_table = null
}
let exec_state = core.executor.exec(root, cache_table)
let res = stringify(root)
fs.writeFileSync(file_path + ".cache.json", JSON.stringify(exec_state.cache_table))
fs.writeFileSync(file_path + ".bak", src)
fs.writeFileSync(file_path, res)
console.log(root.write_tree())