import { evomark_core } from "../core";
import { def } from "./def";
import { lm } from "./lm";
import { save } from "./save";
import { set } from "./set";
import { show } from "./show";

export function essential_cmds(core: evomark_core) {
    def(core)
    show(core)
    //hello(core)
    lm(core)
    set(core)
    save(core)
}