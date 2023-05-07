import {evomark_parser} from "../parser"
import * as fs from 'fs'
import {default_rules} from "../rule/default"

let parser = new evomark_parser()
var args = process.argv.slice(2);
let file_path = args[0]
console.log(file_path)
let src: string = fs.readFileSync(file_path, {encoding: 'utf8'})
let core = default_rules()
let [rendered, page_info] = core.process(src, null, file_path)
console.log(rendered)