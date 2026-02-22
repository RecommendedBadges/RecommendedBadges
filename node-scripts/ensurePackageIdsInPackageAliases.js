#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import { HUB_ALIAS, PACKAGE_ALIASES, PACKAGE_DIRECTORIES } from './constants.js';

export default async function ensurePackageIdsInPackageAliases() {
    let packagesToQuery = [];
    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        if(!Object.keys(PACKAGE_ALIASES).includes(packageDirectory.package) && packageDirectory.package) {
            packagesToQuery.push(packageDirectory.package);
        }
    }

    if(packagesToQuery.length > 0) {
        let queryConditionNames = packagesToQuery.map(x => '\'' + x + '\'').join(', ');
        const {stdout, stderr} = await exec(
            `sf data query -q "SELECT Id, Name FROM Package2 WHERE Name IN (${queryConditionNames})" -o ${HUB_ALIAS} -t --json`
        );
        if(stderr) {
            process.stderr.write(`Error in ensurePackageIdsInPackageAliases(): ${stderr}`);
            process.exit(1);
        }

        let queryResults = JSON.parse(stdout).result.records;
        for(let record of queryResults) {
            PACKAGE_ALIASES[record.Name] = record.Id;
        }
    }
}