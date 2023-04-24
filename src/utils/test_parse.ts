

import * as index from "../parser/utils"




let res = index.find_next_pairing_ignore_quote("(", ")", "(())", 1)
console.log(res)