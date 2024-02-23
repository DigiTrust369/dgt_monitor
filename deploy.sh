#!/bin/bash
docker build -t dgt-monitor .
docker push dgt-monitor

ssh deploy@$DEPLOY_SERVER << EOF
docker pull dgt-monitor
docker stop dgt-monitor || true
docker rm dgt-monitor || true
docker rmi dgt-monitor:current || true
docker tag dgt-monitor:latest dgt-monitor:current
docker run -d --restart always --name dgt-monitor -p 3000:3000 dgt-monitor:current
EOF
