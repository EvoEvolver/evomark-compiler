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
let [rendered, page_info] = core.process(src, null, file_path)
console.log(rendered)