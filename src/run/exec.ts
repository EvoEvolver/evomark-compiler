import * as fs from 'fs'
import {default_rules} from "../rule/default"


let args = process.argv.slice(2);
let file_path = args[0]
let src: string = fs.readFileSync(file_path, {encoding: 'utf8'})
let core = default_rules()
let { rendered, root } = core.process(src, null, file_path)

console.log(root.write_tree())
console.log(rendered)