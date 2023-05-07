import * as fs from 'fs'
import {default_rules} from "../rule/default"
import {get_cmd_list} from '../exec/exec';

var args = process.argv.slice(2);
let file_path = args[0]
let src: string = fs.readFileSync(file_path, {encoding: 'utf8'})
let core = default_rules()
let [root, parse_state] = core.parser.parse(src, {})
console.log(root.write_tree())

let cmd_list = get_cmd_list(root)


console.log(cmd_list)