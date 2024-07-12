#!/bin/bash

# echo "$PRIVATE_KEY" --import >gpg
# echo "$PUBLIC_KEY" --import >gpg
git config --global user.email "sami+builderbot@builder.io"
git config --global user.name "builderio-bot"
# git config --global user.signingkey $KEY_ID
# git config --global commit.gpgsign true
echo foo >bar.txt
git add .
git commit -S -m "This commit is signed!"
git push
