
%site = $def{Gitlab}
%ctx = $def{}

%a = $lm{}{In %site , you can find}

$set{%a}('bfb36c76706079bc76ba5e0fc6ab28b5'){
  In Gitlab , you can find GitLab is an open-source code collaboration platform that helps developers and IT professionals manage their projects and tasks. On GitLab, developers can easily share code, document their workflows, collaborate on projects, and review code. Additionally, GitLab provides advanced features such as issue tracking, merge requests, and continuous integration & delivery. With GitLab, organizations can securely manage their source code, build and deploy their applications, and manage the full software development lifecycle from one easily accessible place.
}

$show{%a}{
  In Gitlab , you can find GitLab is an open-source code collaboration platform that helps developers and IT professionals manage their projects and tasks. On GitLab, developers can easily share code, document their workflows, collaborate on projects, and review code. Additionally, GitLab provides advanced features such as issue tracking, merge requests, and continuous integration & delivery. With GitLab, organizations can securely manage their source code, build and deploy their applications, and manage the full software development lifecycle from one easily accessible place.
}

%sum = $lm{
  Summarize the following in no more than 20 words:
  %a
  Answer:
}

$show{%sum}{
   GitLab is an open-source code collaboration platform that helps developers and IT professionals manage projects, collaborate, review code, and track issues in one place.
}

%ctx = $def{
  %ctx
  %sum
}

#box{
  %sum
}

