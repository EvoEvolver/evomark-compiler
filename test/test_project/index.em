#config{
    title = "Hello World!"
}


$$1 = $def{
    This is the back ground of the story!
}

#sec{Hello world!} 

@a = 
#remark#list{
    Here is a list
}{
    I am the second item
}

#ref{@a} is an awesome list!

@1 = $prompt{
    $put(@background)
    Based on the back ground, we want to ask:

}

$$$res(DA2AD27HAJK2){

}

$show($gen(@1))

@2 = $summarize{

}

#slides{
    #slide{
        #clk(1)#box{
            Hello!
            #voice{
                Hello!
            }
        }
        #clk(1)#box{
            Hello!
        }
    }
    #slide{
        #equ{
            E = mc^2
        }
    }
}