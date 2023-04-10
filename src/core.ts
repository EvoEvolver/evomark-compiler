import { evomark_parser } from "./parse"
import { evomark_tokenizer } from "./tokenize"

export class evomark_core {

    public parser: evomark_parser
    public tokenizer: evomark_tokenizer

    public constructor() {
        this.parser = new evomark_parser()
        this.tokenizer = new evomark_tokenizer()
    }

    public process(src: string) {
        let root = this.parser.parse(src)
        console.log(root.write_tree())
        let tokens = this.tokenizer.tokenize(root)
        let render_res = []
        for (let token of tokens) {
            render_res.push(token.write())
        }
        console.log(render_res.join(""))
    }
}

export type func_rule = (evomark_core) => void