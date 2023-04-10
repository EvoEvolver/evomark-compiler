import { evomark_core } from "./core"
import { equ } from "./rules/equ"
import { config, make_config_rule } from "./rules/config"
import { list } from "./rules/list"
import { figure } from "./rules/figure"
import { slides } from "./rules/slides"

export function make_default_core(): evomark_core {
    let core = new evomark_core()
    equ(core)
    config(core)
    make_config_rule("author", "author")(core)
    list(core)
    figure(core)
    slides(core)
    return core
}