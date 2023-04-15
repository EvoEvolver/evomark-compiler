#config{
    title = "Hello World!"
}

#sec{Hello world!} 

@a = 
#remark#list{
    Here is a list
}{
    I am the second item
}

#ref{@a} is an awesome list!


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