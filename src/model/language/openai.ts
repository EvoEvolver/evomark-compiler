import {Configuration, OpenAIApi} from "openai";
import {openAiApiKey} from "../../secret";

export async function query_lm_async(input: any): Promise<string> {
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

export function query_lm_sync(input: any): string {
    let ans = undefined
    query_lm_async(input).then(result => {
        ans = result
    })
    while (ans === undefined) {
        require('deasync').sleep(50);
    }
    return ans
}