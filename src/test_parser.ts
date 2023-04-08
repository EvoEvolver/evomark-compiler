import { evomark_parser } from "./parse"
import { evomark_tokenizer } from "./tokenize"
import * as fs from 'fs'


let parser = new evomark_parser()
let s: string  = fs.readFileSync("../test/example.em", {encoding:'utf8'})
let root = parser.parse(s)
console.log(root.print_tree())

let tokenizer = new evomark_tokenizer()
let tokens = tokenizer.tokenize(root)

for(let token of tokens){
    console.log(token.print())
}