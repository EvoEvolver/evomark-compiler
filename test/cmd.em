%b = $def{
  hello
}

%a = $def{
  %b is hello
  %b is not hello
}

%h = $hello{
  a
}

$cache{%h}("be5b4c12350d31df9b4d1e64b39fff57"){Hello! a}
$cache{%h}("be5b4c12350d31df9b4d1e66b39fff57"){Hello! a}
$show{%h}
$t{
  Hello! a  
}

