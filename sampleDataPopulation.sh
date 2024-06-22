#! /bin/bash
while getopts o: flag
do
    case "${flag}" in
        o) targetorg=${OPTARG};;
    esac
done

targetorg=${targetorg:-$(sf config get target-org --json | jq -r '.result[0].value')}

sf org assign permset -n Core_Permissions
sf data upsert bulk -s Recommended_Badge_Mix__c -f ./test-data/recommended-badge-mixes.csv -i Test_External_Id__c -w 10
sf data upsert bulk -s Mix_Category__c -f ./test-data/mix-categories.csv -i Test_External_Id__c -w 10
sf data bulk upsert -s Recommended_Trail__c -f ./test-data/recommended-trails.csv -i Test_External_Id__c -w 10
sf data bulk upsert -s Recommended_Badge__c -f ./test-data/recommended-badges.csv -i Test_External_Id__c -w 10