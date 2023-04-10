import { parse as toml_parse } from 'toml'
import { parse as rjson_parse } from 'relaxed-json'
import { readFileSync } from "fs"
import { resolve } from "path"
import { parse_state } from '../parse'

enum dict_langs {
    json = "json",
    toml = "toml"
}

export function parse_dict(src: string, lang: string, state: parse_state): any {
    switch (lang) {
        case "toml": {
            try {
                return toml_parse(src)
            }
            catch (error) {
                state.push_warning_node_to_root("TOML Parsing error on line " + error.line + ", column " + error.column +
                ": " + error.message)
                return null
            }
        }
        case "json": {
            return rjson_parse(src, { warnings: true })
        }
    }
}

export function load_dict(base_path: string, src_path: string, state: parse_state): any {
    let src: string
    let lang: string
    if (src_path) {
        try {
            let extension_name = src_path.slice(src_path.lastIndexOf("."), src_path.length)
            switch (extension_name) {
                case ".toml": lang = "toml"; break;
                case ".json": lang = "json"; break;
                default: {
                    state.push_warning_node_to_root("Not supported extension name \"" + extension_name + "\"");
                    return null
                }
            }
            let src = readFileSync(resolve(base_path, src_path), 'utf-8')

        } catch (error) {
            state.push_warning_node_to_root("Fail to import \"" + src_path + "\". " + error.message);
            return null
        }
    }
    return parse_dict(src, lang, state)
}