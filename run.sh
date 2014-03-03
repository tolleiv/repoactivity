#!/bin/bash

export JETTY_HOME=res/jetty/
export JAVA_OPTIONS=-Dsolr.solr.home=../solrdata/

DEFAULT=start

$JETTY_HOME/bin/jetty.sh ${1:-$DEFAULT}

# node app.js &
