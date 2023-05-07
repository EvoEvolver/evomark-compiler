

#mean(mingzi){
    The name of someone.
}

@a :=
#box{
    My name is Mike.
}

@b :=
#box{
    Here is a sample of Chinese self-introduction:
    #write{@a}
}

#box{
    @answer = #lm{
        Let us define
        #extract_def{@a}

        Summarize the following        
        #write_text{@b}

        Answer:
    }{
        #saved{HASHH8ASHH7ASH9ASH}{
            prompt
        }{
            answer
        }
    }

    #write_prompt(@answer)
    
    @lang = #lm{
        Here is an argument:
        #write_text{@a}

        Do you think it is correct? Answer:
    }

}