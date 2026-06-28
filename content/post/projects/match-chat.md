+++
author = "Tiago"
title = "Match Chat: The feature FIFA didn't add to their app"
date = "2026-06-27"
summary = "I wanted a simple, focused way to follow World Cup matches without spoilers. The official apps and alternatives were too noisy. So I built my own."
tags = [
    "fuck-yeah",
    "web-app",
    "side-project",
    "parenting",
]
categories = [
    "projects"
]
draft = false
+++

# The Problem

Being a new-ish dad with a little one means I need to be smart about which matches to watch fully and which ones I just catch the highlights for.

I tried just adding matches to my calendar. That worked okay, but it cluttered my daily agenda and I couldn't see any other info besides date/time/who. I'd have to go somewhere else to look up the score to decide if it was worth watching the highlights or the entire match. Not ideal.
- I also never liked that to make that decision, I had to get spoiled about the current score or the final result.

What about existing apps? like the official FIFA one?
- noooope, but it's terrible for my use case. It bombards you with notifications. And the moment you open it? Spoilers everywhere. You see the final score before you've even decided if you're going to watch.

I checked out some alternatives I could find. They all felt too busy. Standings, player stats, endless notifications, lots of ads, and so on. Some of them like Matchday26 was good and had cool info in it! but it was a bit overkill for my minimalist taste and I really just wanted something that I could navigate quickly around.

# The Solution: Build It Myself
I love building shit. I have way more prototypes than I can count.
So I thought, well let me fire up Claude here and some other LLM agents and start proposing a solution to my issues and see if they can find me something and what are some ways of getting match data from APIs.  

well it didn't look hard at all, so I created a spec, hopped onto Claude Design and created something that looked decent, popped it over to VS Code and detailed how I wanted the code architecture to be like and then went back and forth with Claude Code to build me something. About 18 hours later - with lots of diaper changes, house work, getting ready for a trip to Seattle, and so on ... I had a working app!

# My Favorite Feature: Goals Without Spoilers

My favorite feature: **you can see how many goals were scored without knowing which team scored them.**

Say I haven't watched a match yet. I open the app and see "3 goals in this match." That tells me there was action, without spoiling who won.

Plus it shows the timestamps of the goals. So if all 3 happened in the second half, I know that I could skip to the action instead of sitting through a potentially dull first half.

This is a feature I had no idea I wanted and it just happened to pop up as a workflow/usecase as I was using the app and I experienced how it helped!

# Other Features I Added

## Match Result Predictions

Predicting match results is fun. You can make your picks before the match starts (or before you watch the replay) and see how you did.

## Non-Spoiler Match Discussion

I also wanted a way to chat with friends about games without spoilers.

So there's a messaging feature where people can leave comments on a match. You can see people are talking, but you choose when to reveal the comments. Good for group chats too. Your friend can say "Check the comments on the Brazil match!" and you know something happened, just not what.

## Building an Invite System

I also used this project as an excuse to build an invite system. Anyone can browse the app, but to comment or predict, you need an invite code. Each participant can generate codes and share them with friends.

The cool part: it creates a chain. The admin invites people, those people invite others, and so on. If someone acts up, I can trace back who invited them and if it keeps happening, prune that whole branch. It's an interesting way to keep the community clean and even deal with bots—no anonymous sign-up means bots have to get an invite from someone real.

# The Remaining Problem

When I go watch the actual match on Peacock, I have to squint and blur my vision just to navigate the UI without seeing scores pop up. Then I still need to figure out how to pause it and start from the beginning so I can watch it spoiler-free.
- that is a problem to be solved some other time. Perhaps I should hit them up with some feature suggestions hehe

# Want to try it out?
Not sure when you are reading it, but during the world cup ... it will be available here:
- https://www.tiago.dev/match-chat
- Hit me up via email to ask for an invite code in case you want to interact with myself and some of kind friends who have helped me find some bugs <3
