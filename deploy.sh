#!/usr/bin/env sh

# 忽略错误
set -e

# 构建
vitepress build docs

# 进入待发布的目录
cd docs/.vitepress/dist

# 如果是发布到自定义域名
#echo 'https://imousse.gitee.io/cswiki' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果部署到 https://<USERNAME>.github.io
git push -f git@github.com:iMousse/vite.git main:pages

# 如果是部署到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
#git push -f git@gitee.com:iMousse/vite.git main:pages

cd -
