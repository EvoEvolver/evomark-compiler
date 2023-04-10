import { evomark_parser } from "./parse"
import { evomark_tokenizer } from "./tokenize"
import * as fs from 'fs'
import { evomark_core } from "./core"
import { make_default_core } from "./default"
let parser = new evomark_parser()
let src: string  = fs.readFileSync("../test/ref_define.em", {encoding:'utf8'})
let core = make_default_core()
core.process(src)