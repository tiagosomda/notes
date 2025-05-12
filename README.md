# initialize submodules
git submodule update --init --recursive

# remove submodule
0. 0: mv a/submodule a/submodule_tmp

1. 1: git submodule deinit -f -- a/submodule    
2. 2: rm -rf .git/modules/a/submodule
3. 3: git rm -f a/submodule
### Note: a/submodule (no trailing slash)
### or, if you want to leave it in your working tree and have done step 0
3. 3: git rm --cached a/submodule
3bis mv a/submodule_tmp a/submodule

# add submodule
git submodule add -b master git@github.com:tiagosomda/tiagosomda.github.io.git public

# add submodule theme
git submodule add https://github.com/cntrump/hugo-notepadium.git themes/hugo-notepadium

# RSS Feed
https://notes.tiago.dev/index.xml

# Hugo Usage

## Build the site
```
hugo
```
This will generate the static site in the `docs/` directory.

## Serve locally (preview changes)
```
hugo serve
```
This starts a local server at http://localhost:1313 and watches for changes.

## Show drafts and future posts
- To include drafts:
  ```
  hugo serve -D
  ```
- To include future-dated posts:
  ```
  hugo serve -F
  ```
- To include both drafts and future posts:
  ```
  hugo serve -D -F
  ```

## Build including future posts
```
hugo -F
```