#!/bin/bash

docker build --platform linux/amd64 --tag maayanlab/cfde-info:0.1.5 .

docker push maayanlab/cfde-info:0.1.5 
