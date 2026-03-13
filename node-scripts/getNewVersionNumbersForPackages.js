#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import { HUB_ALIAS, PACKAGE_DIRECTORIES } from './constants.js';

async function getNewVersionNumbersForPackages(packagesToUpdate) {
    const newVersionsByPackage = {};
    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        if(packageDirectory.package && packagesToUpdate.includes(packageDirectory.package)) {
            let splitVersionNumber = packageDirectory.versionNumber.split('.');
            const latestVersion = await getLatestPackageVersionNumber(packageDirectory.package, splitVersionNumber[0], splitVersionNumber[1]);
            const newVersion = latestVersion.released ? 
                `${latestVersion.majorVersion}.${Number.parseInt(latestVersion.minorVersion) + 1}.${latestVersion.patchVersion}.1` :
                `${latestVersion.majorVersion}.${latestVersion.minorVersion}.${latestVersion.patchVersion}.${Number.parseInt(latestVersion.buildNumber) + 1}`;
            newVersionsByPackage[packageDirectory.package] = newVersion;
        }
    }
    process.stdout.write(JSON.stringify(newVersionsByPackage));
}

async function getLatestPackageVersionNumber(packageName, majorVersion, minorVersion) {
    const {stdout, stderr} = await exec(
        `sf data query -q "SELECT MajorVersion, MinorVersion, PatchVersion, BuildNumber, IsReleased FROM Package2Version WHERE Package2.Name='${packageName}' ORDER BY MajorVersion DESC, MinorVersion DESC, PatchVersion DESC, BuildNumber DESC" -t -o ${HUB_ALIAS} --json`
    );
    if(stderr) {
        process.stderr.write(`Error in getLatestPackageVersionNumbers(): ${stderr}`);
        process.exit(1);
    }

    const package2Version = JSON.parse(stdout).result.records[0];
    let released = false;
    if(package2Version.MajorVersion === majorVersion && package2Version.MinorVersion === minorVersion) {
        for(const record of JSON.parse(stdout).result.records) {
            if(record.IsReleased) {
                released = true;
                break;
            }
        }
    }
    const latestPackageVersion = {
        majorVersion: package2Version.MajorVersion,
        minorVersion: package2Version.MinorVersion,
        patchVersion: package2Version.PatchVersion,
        buildNumber: package2Version.BuildNumber,
        released
    };
    return latestPackageVersion;
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
    const arg = process.argv.slice(2).join(',').replace('packagesToUpdate=', '').split(' ');
    getNewVersionNumbersForPackages(arg);
}