#!/usr/bin/env bash

if [ $SERVER_NAME = 'all' ]; then
  echo "Building all \"@$TEST_TYPE/*\" servers"
  yarn g:nx run-many -p @$TEST_TYPE/* -t build
else
  SERVERS=$(echo $SERVER_NAME | tr ',' '\n' | xargs -I _ echo @$TEST_TYPE/_ | tr '\n' ',')
  echo "Building servers: $SERVERS"
  yarn g:nx run-many -p $SERVERS -t build
fi
