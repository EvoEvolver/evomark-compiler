# TODO

- New parser for `func` and `cmd`
- No side effect in parse phase. If need, do it in the tokenization phase.
- Add `if` statement.
- Register of artifacts (output files) in `ctx`
- Register dependency in `ctx`
- Difference execution mode (Non-compute mode)
- A new parser and prettier for `param`, making it accepts `var` and `ref`
- Garbage collection for unused cache
- Asynchronous execution for heavy functions. Execute them together and wait for all of them to finish.


# Proposal

```Evomark
%d = $fun(%a, %b){
    %a1 = 
}
```