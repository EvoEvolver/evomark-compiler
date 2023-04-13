import { evomark_parser } from "./parse"
import { evomark_tokenizer } from "./tokenize"
import * as fs from 'fs'
import { evomark_core } from "./core"
import { make_default_core } from "./default"
let parser = new evomark_parser()
let src: string  = fs.readFileSync("../test/slides.em", {encoding:'utf8'})
let core = make_default_core()
let rendered = core.process(src, null)

console.log(rendered)