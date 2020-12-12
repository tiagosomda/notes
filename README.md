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