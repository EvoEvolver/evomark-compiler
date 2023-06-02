import {evomark_core} from "../../core";
import {buffer} from "./buffer";
import {def} from "./def";
import {init} from "./init";
import {lm} from "./lm";
import {load} from "./load";
import {retake} from "./retake";
import {save} from "./save";
import {set} from "./set";
import {show} from "./show";
import {put} from "./put";
import {hello} from "./hello";

export function essential_cmds(core: evomark_core) {
    def(core)
    show(core)
    hello(core)
    lm(core)
    set(core)
    save(core)
    load(core)
    buffer(core)
    init(core)
    retake(core)

    put(core);
}