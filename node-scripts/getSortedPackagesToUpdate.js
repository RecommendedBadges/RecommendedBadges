#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import fs from 'node:fs';
import sortPackages from './sortPackages.js';
import ensurePackageIdsInPackageAliases from './ensurePackageIdsInPackageAliases.js';
import getPackageNameFromDependency from './getPackageNameFromDependency.js';
import { PACKAGE_DIRECTORIES } from './constants.js';

const OUTPUT_FILENAME = '/tmp/artifacts/packagesToUpdate.txt';
const BASE_BRANCH = 'main';

export async function getChangedPackageDirectories() {
    let changedFiles = [];
    const changedPackageDirectories = new Set();
    try {
        const {stdout, stderr} = await exec(`git diff origin/${BASE_BRANCH} --name-only`);
        if(stderr) {
            process.stderr.write(`Error in getChangedPackageDirectories(): ${stderr}`);
            process.exit(1);
        }
        changedFiles = stdout.split('\n');
        for(const changedFile of changedFiles) {
            if(changedFile.indexOf('/') != -1) {
                changedPackageDirectories.add(changedFile.substring(0, changedFile.indexOf('/')));
            }
        }
    } catch(err) {
        process.stderr.write(`Error in getChangedPackageDirectories(): ${err}`);
        process.exit(1);
    }
    return changedPackageDirectories;
}

async function getPackagesToUpdate(changedPackageDirectories) {
    const packagesToUpdate = new Set();
    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        if(changedPackageDirectories.has(packageDirectory.path) && packageDirectory.package) {
            packagesToUpdate.add(packageDirectory.package);
        }
    }

    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        if(packageDirectory.dependencies) {
            for(const dependentPackage of packageDirectory.dependencies) {
                const packageName = await getPackageNameFromDependency(dependentPackage);
                if(packageName && packagesToUpdate.has(packageName)) {
                    packagesToUpdate.add(packageDirectory.package);
                }
            }
        }
    }
    return packagesToUpdate;
}

export default async function getSortedPackagesToUpdate() {
    const changedPackageDirectories = await getChangedPackageDirectories();
    await ensurePackageIdsInPackageAliases();
    const packagesToUpdate = await getPackagesToUpdate(changedPackageDirectories);
    const sortedPackagesToUpdate = await sortPackages(packagesToUpdate, PACKAGE_DIRECTORIES);
    process.stdout.write(sortedPackagesToUpdate.join(' '));
    fs.writeFileSync(OUTPUT_FILENAME, sortedPackagesToUpdate.join('\n'));
    process.exit(1);
}
