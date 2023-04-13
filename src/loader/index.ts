import * as dir from "node-dir"
import { is_forbidden_path, write_file } from './helper'
import * as path from 'path'
import * as fs from 'fs'
import { load_asset, load_config, load_evomark, loader_func } from "./loader";

export function compile_all(src_path: string, input_base: string, output_base: string) {
    let ctx = {}
    // Ensure there is a emconfig.json
    test_and_create_emconfig(input_base, output_base)
    dir.files(src_path,
        function (err: any, files: string[]) {
            if (err) throw err;
            files.forEach((filepath: string)=>{
                console.log(filepath)
                if (is_forbidden_path(filepath)) {
                    return
                } else {
                    load("init", filepath, input_base, output_base, ctx)
                }
            })
            save_ctx(ctx, output_base)
        });
}

export function test_and_create_emconfig(input_base: string, output_base: string){
    if(!fs.existsSync(path.join(input_base, "emconfig.toml"))){
        write_file(path.join(output_base, "pages", "emconfig.json"), "{}")
    }
}

export function save_ctx(ctx: any, output_base: string){
    write_file(output_base+"/pages/emctx.json", JSON.stringify(ctx))
}

const loader_map: Record<string, loader_func> = {
    ".em": load_evomark,
    ".jpg": load_asset,
    ".png": load_asset,
    ".gif": load_asset,
    ".svg": load_asset,
    ".toml": load_config
}

function load(evt, file_path: string, input_base, output_base, ctx) {
    if (evt == 'remove') {
        return
    }
    if (is_forbidden_path(file_path)) {
        return
    }
    let nameEnd = file_path.length;
    let filename = file_path.slice(file_path.lastIndexOf(path.sep), nameEnd)
    let extName = file_path.slice(file_path.lastIndexOf("."), nameEnd)
    if (filename.slice(0, 2) === "__") return
    let fileLoader = loader_map[extName]
    if (!fileLoader) return
    fileLoader(file_path, input_base, output_base, ctx)
    console.log(file_path + " processed")
    //console.log(options.compileEnv)
}