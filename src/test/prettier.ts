import {evomark_parser} from "../parser"
import * as fs from 'fs'
import {default_rules} from "../rule/default"
import {stringify} from "../prettier";

let parser = new evomark_parser()
var args = process.argv.slice(2);
let file_path = args[0]
let src: string = fs.readFileSync(file_path, {encoding: 'utf8'})
let core = default_rules()
let [root, parse_state] = core.parser.parse(src, null)
console.log(root.write_tree())
console.log(stringify(root))
