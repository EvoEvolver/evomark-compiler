
#slides{
    #slide{
        %topic = $def{
            Characteristics of an Ideal Compiler        
        }
        %point = $def{
            - User Interface
            -- Precise and clear diagnostic messages
            -- Easy to use processing options
            - Correctly implements the entire language
            - Detects all statically detectable errors
            - Generates highly optimal code
            - Compiles quickly using modest system resources
            - Good software engineering practice
            -- Well modularized, well documented, thoroughly tested, etc.        
        }

        #sec{%topic}
        $put{
            #list{
            %point
            }        
        }
        %script = $lm{
            Imagine you are a teacher giving a lecture and you are talking about %topic with the following points:
            %point
            You can use the following script to help you:        
        }

        $show{%script}{
             Good morning class, today we will be discussing the Characteristics of an Ideal Compiler. 
            
            First off, we have the User Interface. This refers to the way the compiler is presented to the user, and how easy it is to use. Clear and precise diagnostic messages make it easier to debug and use the compiler, so this is an important characteristic. Having a wide range of useful processing options also helps in making optimal use of the compiler.
            
            Next, it is important that the compiler correctly implements the entire language. This ensures that the language performs according to the intended specifications and that it is able to handle the outcomes of all supported statements.
            
            Moving on, it is important for a compiler to be able to detect all statically detectable errors, such as type mismatches, variables that are not declared, and so on. This helps to prevent any erroneous results from inadvertently creeping in.
            
            In addition to this, an ideal compiler should generate highly optimal code that uses system resources as efficiently as possible. This helps to ensure faster execution time and fewer system resources being used.
            
            Finally, an ideal compiler should also be bound by good software engineering practices. This includes being well-modularized, well-documented, and thoroughly tested.
            
            That concludes the characteristics of an ideal compiler. Any questions?        
        }
        #clk#voice{%script}    
    }
}

