
export function is_letter(){
    
}

export function find_next_pairing_ignore_quote(open:string, close:string, src:string, start:number){
    let curr_quote = -1
    let nest = 1
    for(let pos=start; pos<src.length; pos++){
        let quote = "\"'".indexOf(src[pos])
        if(curr_quote==-1){
            if(quote>=0){
                curr_quote = quote
                continue
            }
            else{
                if(src[pos] == close){
                    if(nest == 1)
                        return pos
                    else{
                        nest --
                    }
                }
                else if(src[pos] == open){
                    nest ++
                }
                continue
            }
        }
        else if(curr_quote == quote){
            curr_quote = -1
            continue
        }
    }
    return -1
}