import * as fs from 'fs'
import * as path from 'path'

export function create_output_path(file_path: string, input_base: string, output_base: string, new_ext_name: string) {
    let relativePath = path.relative(input_base, file_path)
    let outputPath = path.resolve(output_base, relativePath)
    if (new_ext_name) outputPath = outputPath.slice(0, outputPath.lastIndexOf(".")) + "." + new_ext_name
    fs.mkdirSync(outputPath.slice(0, outputPath.lastIndexOf(path.sep)), {recursive: true})
    return outputPath
}

export function is_forbidden_path(file_path: string) {
    let splitted = file_path.split(path.sep)
    for (let item of splitted) {
        if (item[0] == ".")
            return true
    }
    return false
}

export function create_new_folder(folder_path: string) {
    if (fs.existsSync(folder_path)) {
        if (fs.lstatSync(folder_path).isDirectory()) {
            fs.rmSync(folder_path, {recursive: true});
        } else {
            fs.unlinkSync(folder_path)
        }
    }
    fs.mkdirSync(folder_path)
}

export function write_file(output_path: string, content: string) {
    fs.writeFile(output_path, content, (err) => {
        if (err) throw err;
        //console.log('The file has been saved!');
    })
}