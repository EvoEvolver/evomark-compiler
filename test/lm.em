
%subject = $def{augmented reality}

%context = $def{}

%question = $def{The reason why %subject is important:}

$show{%question}
$t{
  The reason why augmented reality is important:
}

%h = $lm{%question}

$show{%h}
$t{
  Augmented reality (AR) brings a new level of engagement to the consumer experience, enabling users to interact with virtual 3D objects in the physical world. It has the potential to revolutionize the way people interact with the world around them, create new experiences, and extend current capabilities. From interactive gaming to e-commerce, education and healthcare, the possibilities that augmented reality offers are limitless. Encouraging further exploration into the field of AR will extend the opportunity for users to explore new horizons, create new ways of engaging with the world, and revolutionize the way people interact and behave.
}

%summarized = $lm{Summarize the following in no more than 20 words: %h}

%context = $def{
  %context
  %summarized
}

$show{%context}
$t{
  Augmented reality offers limitless potential to revolutionize interaction, create new experiences, and extend current capabilities.
}

$show{%summarized}
$t{
  Augmented reality offers limitless potential to revolutionize interaction, create new experiences, and extend current capabilities.
}
