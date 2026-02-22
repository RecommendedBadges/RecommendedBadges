#!/bin/env node

import { PACKAGE_DIRECTORIES } from './constants.js';

function getNewVersionNumbersForPackages(packagesToUpdate) {
    const packagesToUpdateSet = new Set(packagesToUpdate);
    const newVersionsByPackage = {};
    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        if(packageDirectory.package && packagesToUpdateSet.has(packageDirectory.package)) {
            const versionNumber = packageDirectory.versionNumber?.replace('NEXT', '1');
            const splitVersionNumber = versionNumber?.split('.');
            const newVersion = `${splitVersionNumber[0]}.${Number.parseInt(splitVersionNumber[1]) + 1}.${splitVersionNumber[2]}.1`;
            newVersionsByPackage[packageDirectory.package] = newVersion;
        }
    }
    process.stdout.write(JSON.stringify(newVersionsByPackage));
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
    const arg = process.argv.slice(2).join(',').replace('packagesToUpdate=', '').split(',');
    getNewVersionNumbersForPackages(arg);
}