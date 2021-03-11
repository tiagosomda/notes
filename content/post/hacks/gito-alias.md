+++
author = "Tiago"
title = "The gito alias"
date = "2021-03-10"
summary = "I often need to open a repo's webpage to look at PRs, get code reference to others and many other reasons. So I created an alias that makes navigating from my terminal to the repo's webpage super easy."
tags = [
    "bash",
    "powershell",
    "git"
]
categories = [
    "hacks"
]
+++

<div>
    <img style="width:100%" src="/imgs/misc/gito.jpg" alt="gito matrix">
</div>

I often need to open a repo's webpage to look at PRs, get code reference to others and many other reasons.   
So I created an alias that makes navigating from my terminal to the repo's webpage super easy.  

A coworker actually showed me part of this.  
He had an alias that echoed the repo's url.  
So I thought, "oh, I can make a command that opens a browser window with that output!"

the git command to get the url is pretty simple: `git config --get remote.origin.url`  
After that, do some regex magic and open a browser with the url! 😄

Here is the code:
- bash: [https://gist.github.com/tiagosomda/28be45e7b22e72a70996f6ba2b218a39](https://gist.github.com/tiagosomda/28be45e7b22e72a70996f6ba2b218a39)
- powershell: [https://gist.github.com/tiagosomda/f6c97a9ffbfb686048895cca2c099b58](https://gist.github.com/tiagosomda/f6c97a9ffbfb686048895cca2c099b58)  

if you improve it or if you have any other useful commands, let me know!