#config{
    bib = "/main.bib"
}


#sec{What is Evomark?}


Evomark is a marking language for content production. Evomark generalizes #em{Markdown} 
for better support of #em{reference} and #em{containers}, which is essential for #em{academic writing}.
Evomark aims to become the top language for paper drafting. 
We hope it can help change the academic publishing media from .pdf file and A4 paper to webpage browser, 
which allows more interactive and intelligent display of content and easier communication between the authors and readers.

@a=
#list{
    I am the first item!
}{
    I am the second!
}

#ref{@a}

@b = #equ{
    1+1=2
}

#ref{@b}

#export{@b}
@c = #import("./asdas/dasdas.em"){@c}

#ref{@c}