#! /bin/bash

packagesToUpdate=('Core' 'Triggers' 'SortCustomMetadata' 'RecommendedArticles' 'RecommendedBadgeMix' 'PrivateMixView' 'UserInterface')

declare -A packageDict

jsonPackages=$(npm run --silent getPackagesToUpdate -- packagesToUpdate="${packagesToUpdate[@]}")
echo $jsonPackages

for key in $(echo "$jsonPackages" | jq -r 'keys[]'); do
    value=$(echo "$jsonPackages" | jq -r --arg k "$key" '.[$k]')
    packageDict[$key]=$value
done

echo "${packageDict[@]}" 
echo "${!packageDict[@]}"  

