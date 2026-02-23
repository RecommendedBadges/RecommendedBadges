#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import { HUB_ALIAS, PACKAGE_DIRECTORIES } from './constants.js';

async function getNewVersionNumbersForPackages(packagesToUpdate) {
    process.stdout.write(`packagesToUpdate ${packagesToUpdate}\r`);
    const packagesToUpdateSet = new Set(packagesToUpdate);
    process.stdout.write(`packagesToUpdateSet ${JSON.stringify(Array.from(packagesToUpdateSet))}\r`);
    const newVersionsByPackage = {};
    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        process.stdout.write(`packageDirectory.package ${packageDirectory.package}\r`);
        process.stdout.write(`$packagesToUpdateSet.has(packageDirectory.package) ${packagesToUpdateSet.has(packageDirectory.package)}\r`);
        if(packageDirectory.package && packagesToUpdateSet.has(packageDirectory.package)) {
            const latestVersion = await getLatestPackageVersionNumber(packageDirectory.package);
            process.stdout.write(`latestVersion ${JSON.stringify(latestVersion)}\r`);
            const newVersion = latestVersion.released ? 
                `${latestVersion.majorVersion}.${Number.parseInt(latestVersion.minorVersion) + 1}.${latestVersion.patchVersion}.1` :
                `${latestVersion.majorVersion}.${latestVersion.minorVersion}.${latestVersion.patchVersion}.${Number.parseInt(latestVersion.buildNumber) + 1}`;
            newVersionsByPackage[packageDirectory.package] = newVersion;
        }
    }
    process.stdout.write(JSON.stringify(newVersionsByPackage));
}

async function getLatestPackageVersionNumber(packageName) {
    const latestPackageVersion = {};
    const {stdout, stderr} = await exec(
        `sf data query -q "SELECT MajorVersion, MinorVersion, PatchVersion, BuildNumber, ReleaseState FROM Package2Version WHERE Package2.Name='${packageName}' ORDER BY MajorVersion DESC, MinorVersion DESC, PatchVersion DESC, BuildNumber DESC LIMIT 1" -t -o ${HUB_ALIAS} --json`
    );
    if(stderr) {
        process.stderr.write(`Error in getLatestPackageVersionNumbers(): ${stderr}`);
        process.exit(1);
    }

    const package2Version = JSON.parse(stdout).result.records[0];
    latestPackageVersion[packageName] = {
        majorVersion: package2Version.MajorVersion,
        minorVersion: package2Version.MinorVersion,
        patchVersion: package2Version.PatchVersion,
        buildNumber: package2Version.BuildNumber,
        released: package2Version.ReleaseState === 'Released'
    };
    return latestPackageVersion;
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
    const arg = process.argv.slice(2).join(',').replace('packagesToUpdate=', '').split(',');
    process.stdout.write(`arg ${JSON.stringify(arg)}\r`);
    getNewVersionNumbersForPackages(arg);
}