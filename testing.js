#! /usr/bin/env node

export function getPackagesToUpdate() {
    process.stdout.write(JSON.stringify({
        "Core": "2.25.0.1",
        "Triggers": "2.21.0.0",
        "SortCustomMetadata": "1.30.0.0",
        "RecommendedArticles":  "1.7.0.0",
        "RecommendedBadgeMix": "1.37.0.0",
        "PrivateMixView": "1.34.0.0",
        "UserInterface": "1.35.0.0"
    }));
}
