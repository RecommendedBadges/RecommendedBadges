#! /bin/bash

declare -A packageDict

jsonPackages=$(npm run --silent getPackagesToUpdate)
echo $jsonPackages

for key in $(echo "$jsonPackages" | jq -r 'keys[]'); do
    value=$(echo "$jsonPackages" | jq -r --arg k "$key" '.[$k]')
    packageDict[$key]=$value
done

echo "${packageDict[@]}" 
echo "${!packageDict[@]}"  

