import { evomark_core } from "./core"
import { equ } from "./rules/equ"
import { config } from "./rules/config"

export function make_default_core(): evomark_core {
    let core = new evomark_core()
    equ(core)
    config(core)
    return core
}