# Captain's Logs

The Hugo source for [notes.tiago.dev](https://notes.tiago.dev), using the custom `tiago-captains-logs` theme.

## Run locally

Hugo Extended is required.

```sh
hugo server
```

Open <http://localhost:1313>. Draft and future-dated transmissions can be included with:

```sh
hugo server --buildDrafts --buildFuture
```

## Build

```sh
hugo --cleanDestinationDir --minify
```

The generated site is written to `public/`. Pushing `main` triggers the GitHub Pages workflow.

## Log metadata

Regular tags remain available through `tags`. A project transmission is marked by adding `projects` to `categories`:

```toml
+++
title = "Transmission title"
date = 2026-07-14
tags = ["gamedev", "tools"]
categories = ["projects"]
+++
```

The main RSS feed is [notes.tiago.dev/index.xml](https://notes.tiago.dev/index.xml). Hugo also generates feeds for individual tags and log channels.
