import { evomark_core } from "./core"
import { equ } from "./func_rule/equ"
import { config, make_config_rule } from "./func_rule/config"
import { list } from "./func_rule/list"
import { figure } from "./func_rule/figure"
import { slides } from "./func_rule/slides"
import { ref } from "./func_rule/ref"
import { section } from "./func_rule/sec"
import { em } from "./func_rule/simple_rules"
import { remark } from "./func_rule/remark"
import { def } from "./cmd_rule/def"
import { hello } from "./cmd_rule/hello"
import { cache } from "./cmd_rule/cache"
import { show } from "./cmd_rule/show"
import { t } from "./cmd_rule/t"
import { lm } from "./cmd_rule/lm"

export function make_default_core(): evomark_core {
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

    // cmd rules
    def(core)
    show(core)
    hello(core)
    cache(core)
    t(core)
    lm(core)
    
    return core
}