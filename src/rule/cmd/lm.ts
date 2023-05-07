import {evomark_core} from "../../core"
import {eval_to_text, exec_state, obj_host} from "../../exec/exec";
import {func_rule, parse_node} from "../../parser";
import {simple_literal_parser} from "../../parser/common";
import {get_param_body_pairs, set_lazy_variable_with_input} from "../utils";
import {openAiApiKey} from "../../secret"

import {Configuration, OpenAIApi} from "openai"


async function query_lm_async(input: any): Promise<string> {
    let prompt = input["prompt"]
    let suffix = input["suffix"] || null
    let echo = input["echo"] || ""
    if (input["echo"]) {
        prompt = [prompt, input["echo"]].join(" ")
    }
    const configuration = new Configuration({
        apiKey: openAiApiKey,
    });
    const openai = new OpenAIApi(configuration);
    let completion
    try {
        completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 2000,
            suffix: suffix
        });
        console.log(completion.data.choices[0].text);
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
    if (completion) {
        let res: string = completion.data.choices[0].text
        return [echo, res.trimStart()].join(" ")
    }
    return null
}

function query_lm_sync(input: any): string {
    let ans = undefined
    query_lm_async(input).then(result => {
        ans = result
    })
    while (ans === undefined) {
        require('deasync').sleep(50);
    }
    return ans
}

function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let input = {}
    let texts = []
    let param_body_pairs = get_param_body_pairs(cmd_node)
    for (let [, body] of param_body_pairs) {
        let [text] = eval_to_text(body.children, state)
        texts.push(text)
    }
    if (texts.length < 1) {
        state.add_fatal("There must be one body as input")
        return
    }
    input["prompt"] = texts[0]
    if (texts.length >= 2) {
        input["echo"] = texts[1]
    }
    if (texts.length >= 3) {
        input["suffix"] = texts[2]
    }
    set_lazy_variable_with_input(state, input, assigned, "lm", query_lm_sync)
}

export function lm(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("lm", simple_literal_parser))
    core.add_exec_rule("lm", exec)
}