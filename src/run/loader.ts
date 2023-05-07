import {load_file} from "../loader";
import * as path from "path"

let args = process.argv.slice(2)
let file_path = args[0]
let input_base = path.resolve(file_path, "..")


load_file("init", file_path, input_base, "/Users/zijian/Documents/GitHub/evomark-ui", {})