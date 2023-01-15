#!/bin/bash
node index.js &
docker-entrypoint.sh rabbitmq-server
# rabbitmqctl add_user guess guess &
# rabbitmqctl set_user_tags guess administrator &
# rabbitmqctl set_permissions -p / guess ".*" ".*" ".*"