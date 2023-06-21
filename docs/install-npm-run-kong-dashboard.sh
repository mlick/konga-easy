#!/bin/bash
#author xiangxin.li
#date 2020-12-8 17:56:05
curl -sL https://rpm.nodesource.com/setup_14.x | bash -
yum install -y gcc-c++ make
yum install -y nodejs
npm install -g cnpm --regist.ry=https://registry.npm.taobao.org
tar -zxvf kong-dashboard-tag_kong-dashboard_2020-1130-002.tar.gz
cd kong-dashboard-tag_kong-dashboard_2020-1130-002/
cnpm install bower -g
cnpm install
bower --allow-root install
echo "PORT=8889" > .env
nohup npm run production &

exit 0