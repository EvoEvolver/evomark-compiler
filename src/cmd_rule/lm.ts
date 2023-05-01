import { evomark_core } from "../core"
import { exec_state, get_hash, host_type, obj_host } from "../exec/exec";
import { parse_node, func_rule } from "../parse";
import { simple_literal_parser } from "../parser/common";
import { get_first_body_node, set_lazy_variable, store_literal_to_host } from "./common";
import { openAiApiKey } from "../secret"

import { Configuration, OpenAIApi } from "openai"


async function query_lm_async(prompt: string): Promise<string> {
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
    if(completion)
        return completion.data.choices[0].text;
    return null
}

function query_lm_sync(input: string): string {
    let ans = undefined
    query_lm_async(input).then(result => {
        ans = result
    })
    while (ans === undefined) {
        require('deasync').sleep(100);
    }
    return ans
}

function exec(cmd_node: parse_node, state: exec_state, assigned: obj_host) {
    if (assigned == null)
        return
    let cmd_body = get_first_body_node(cmd_node)
    set_lazy_variable(state, cmd_body, assigned, "lm", query_lm_sync)
}

export function lm(core: evomark_core) {
    core.parser.add_cmd_rule(new func_rule("lm", simple_literal_parser))
    core.add_exec_rule("lm", exec)
}