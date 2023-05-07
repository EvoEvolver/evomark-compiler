import * as fs from 'fs'
import * as path from 'path'
import * as toml from 'toml'
import {create_output_path, write_file} from './helper'
import {default_rules} from '../rule/default'

export type loader_func = (file_path: string, input_base: string, output_base: string, ctx: any) => void


export function load_asset(file_path: string, input_base: string, output_base: string, ctx: any) {
    let output_path = create_output_path(file_path, input_base, path.join(output_base, "pages"), null)
    fs.copyFileSync(file_path, output_path)
}

export function load_config(file_path: string, input_base: string, output_base: string, ctx: any) {
    if (file_path !== input_base + path.sep + "emconfig.toml")
        return
    let output_path = create_output_path(file_path, input_base, path.join(output_base, "pages"), "json")
    let content = fs.readFileSync(file_path, "utf-8")
    let config_obj: string
    try {
        config_obj = toml.parse(content)
    } catch (error) {
        console.log(error.message)
    }
    let rendered = JSON.stringify(config_obj)
    fs.writeFileSync(output_path, rendered)
}

export function load_evomark(file_path: string, input_base: string, output_base: string, ctx: any) {
    let core = default_rules()
    let output_path = create_output_path(file_path, input_base, path.join(output_base, "pages"), "page.vue")
    let relative_path = path.relative(input_base, file_path)
    let env = prepareEnv(input_base, relative_path)

    let rendered: string
    let page_info: any = {
        env: {}
    }
    try {
        let content: string = fs.readFileSync(file_path, "utf-8")
        let res = core.process(content, env, file_path)
        rendered = res[0]
        page_info = res[1]
    } catch (error) {
        rendered = "<template><pre><code>" + error.message + "\n" + error.stack + "</code></pre></template>"
    }
    //console.log(rendered)
    write_file(output_path, rendered)
    relative_path = relative_path.slice(0, relative_path.lastIndexOf("."))

    if (page_info["title"]) {
        ctx["title." + relative_path] = page_info.title
    }

}

function prepareEnv(input_base, relativePath) {
    let env = {input_base: input_base}
    let project_env
    try {
        let raw = fs.readFileSync(path.join(input_base, "emconfig.toml"), 'utf-8')
        project_env = toml.parse(raw)
    } catch (error) {
    }
    if (project_env)
        Object.assign(env, project_env)
    return env
}