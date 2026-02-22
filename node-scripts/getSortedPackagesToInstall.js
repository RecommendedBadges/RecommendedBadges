#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import ensurePackageIdsInPackageAliases from './ensurePackageIdsInPackageAliases.js';
import sortPackages from './sortPackages.js';
import { HUB_ALIAS, PACKAGE_DIRECTORIES } from './constants.js';

async function getLatestPackageVersionIds() {
    let latestPackageVersionIds = {};
    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        if(packageDirectory.package) {
            const {stdout, stderr} = await exec(
                `sf data query -q "SELECT SubscriberPackageVersionId FROM Package2Version WHERE Package2.Name='${packageDirectory.package}' ORDER BY MajorVersion DESC, MinorVersion DESC, PatchVersion DESC, BuildNumber DESC LIMIT 1" -t -o ${HUB_ALIAS} --json`
            );
            if(stderr) {
                process.stderr.write(`Error in getLatestPackageVersionIds(): ${stderr}`);
                process.exit(1);
            }

            latestPackageVersionIds[packageDirectory.package] = JSON.parse(stdout).result.records[0].SubscriberPackageVersionId;
        }
    }
    return latestPackageVersionIds;
}

async function getSortedPackagesToInstall() {
    await ensurePackageIdsInPackageAliases();
    let latestPackageVersionIds = await getLatestPackageVersionIds();

    let packages = new Set();
    for(let packageId in latestPackageVersionIds) {
        packages.add(packageId);
    }

    let sortedPackagesToInstall = await sortPackages(packages, PACKAGE_DIRECTORIES);
    for(let i in sortedPackagesToInstall) {
        sortedPackagesToInstall[i] = latestPackageVersionIds[sortedPackagesToInstall[i]];
    }

    process.stdout.write(`${Array.from(sortedPackagesToInstall).join(' ')}`)
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
    getSortedPackagesToInstall();
}