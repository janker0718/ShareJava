#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# deploy to github pages
#echo 'cd' > CNAME

if [ -z "$GITHUB_TOKEN" ]; then
  msg='deploy'
  githubUrl=git@github.com:janker0718/janker0718.github.io.git
else
  msg='来自github actions的自动部署'
  githubUrl=https://janker0718:${GITHUB_TOKEN}@github.com/janker0718/janker0718.github.io.git
  git config --global user.name "janker0718"
  git config --global user.email "690864766@qq.com@qq.com"
fi
git init
git add -A
git commit -m "${msg}"
git push -f $githubUrl master:gh-pages # 推送到github gh-pages分支


cd -
rm -rf docs/.vuepress/dist
