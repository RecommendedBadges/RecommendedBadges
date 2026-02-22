#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);
import { HUB_ALIAS, PACKAGE_ALIAS_DELIMITER, PACKAGE_ID_PREFIX, PACKAGE_VERSION_ID_PREFIX, PACKAGE_IDS_TO_ALIASES } from './constants.js';

export async function getPackageNameFromDependency(dependentPackage) {
    let endIndex = dependentPackage.package.indexOf(PACKAGE_ALIAS_DELIMITER);
    if(endIndex == -1) {
        endIndex = dependentPackage.package.length;
    }

    if(dependentPackage.package.startsWith(PACKAGE_VERSION_ID_PREFIX) && Object.keys(PACKAGE_IDS_TO_ALIASES).includes(dependentPackage.package)) {
        let alias = PACKAGE_IDS_TO_ALIASES[dependentPackage.package];
        return alias.slice(0, alias.indexOf(PACKAGE_ALIAS_DELIMITER));
    } else if(dependentPackage.package.startsWith(PACKAGE_VERSION_ID_PREFIX)) {
        const {stderr, stdout} = await exec(
            `sf data query -q "SELECT Package2Id FROM Package2Version WHERE SubscriberPackageVersionId='${dependentPackage.package}'" -t -o ${HUB_ALIAS} --json`
        );
        if(stderr) {
            process.stderr.write(`Error in getPackageNameFromDependency(): ${stderr}`);
            process.exit(1);
        }
        let result = JSON.parse(stdout).result.records;
        if(result.length > 0 && PACKAGE_IDS_TO_ALIASES[result[0].Package2Id]) {
            return PACKAGE_IDS_TO_ALIASES[result[0].Package2Id];
        }
    } else if(dependentPackage.package.startsWith(PACKAGE_ID_PREFIX)) {
        return PACKAGE_IDS_TO_ALIASES[dependentPackage.package];
    } else {
        return dependentPackage.package.slice(0, endIndex);
    }
}

module.exports = getPackageNameFromDependency;