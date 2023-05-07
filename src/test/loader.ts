import {load_file} from "../loader/index";
import * as path from "path"

var args = process.argv.slice(2)
let file_path = args[0]
let input_base = path.resolve(file_path, "..")


load_file("init", file_path, input_base, "/Users/zijian/Documents/GitHub/evomark-ui", {})