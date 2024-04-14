+++
author = "Tiago"
title = "Unreal Engine Project Launcher CLI"
date = "2023-04-14"
summary = "I have been diving into Unreal Engine (and loving it). I created this tool to help me on my dev workflow to open, close, regenerate unreal project files."
tags = [
    "unreal",
    "cli",
    "powershell",
]
categories = [
    "projects"
]
draft = false
+++
Hey! how are you?  I hope you are doing well  
I made a cool tool, so I thought about writing about it a bit.  
It is an unreal engine launcher cli that makes it easier to open, close, and regenerate uproject/vssolutions  

you can find the source code here:  
- https://github.com/tiagosomda/ue-launcher-cli

<div>
    <img style="width:100%" src="/imgs/projects/ue-launcher-cli-examples.gif" alt="unreal engine project launcher gif with examples">
</div>

# Why did I create this?

One of the things that I seem to have to do a lot is to...
1. close unreal and visual studio, 
2. delete generated files
3. right click the project
4. select to regenerate it
5. launch visual studio
6. launch the unreal project

<div>
    <img style="height:250px" src="/imgs/memes/getting-through-it.png" alt="meme of me being tired of typing these commands over and over">
</div>

<b> ... those are a lot of steps 😵 </b> <i> ... and many of them are mouse clicks!</i>

since I almost always have a cli open to make git commits, I started by creating a alias that would launch the unreal project.  
- then I realized that I could probably regenerate the files as well,
- and then why not close any unreal and visual studio instances for my project before regenerating it?

## Building it
It had been a while since I had to create a powershell script that would list the currently open projects, so I enlisted copilot to see if it could spit out some functions.  
- It did and it mostly worked, so that got me started into building this cli.  
Once I had things working, I wrapped everything in a powershell module and started using it.  
- It worked super well, so I put it up on github and posted about it on linked in.  


## Was this really necessary?
not really... and there might be a better way to go about it than this workflow, but so far, spending some time on it was rewarding and has been helpful to me. 

### What do you think?
If you end up using or making additions, modifications, or variation of it, let me know!

ps: I have some other useful scripts here as well if you are interested:
- [https://gist.github.com/tiagosomda](https://gist.github.com/tiagosomda)

