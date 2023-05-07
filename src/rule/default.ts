import {evomark_core} from "../core"
import {equ} from "./func/equ"
import {config, make_config_rule} from "./func/config"
import {list} from "./func/list"
import {figure} from "./func/figure"
import {slides} from "./func/slides"
import {ref} from "./func/ref"
import {section} from "./func/sec"
import {em} from "./func/simple_rules"
import {remark} from "./func/remark"
import {essential_cmds} from "./cmd"


export function default_rules(): evomark_core {
    let core = new evomark_core()
    // func rules
    equ(core)
    config(core)
    make_config_rule("author", "author")(core)
    list(core)
    figure(core)
    slides(core)
    ref(core)
    section(core)
    em(core)
    remark(core)

    essential_cmds(core)


    return core
}