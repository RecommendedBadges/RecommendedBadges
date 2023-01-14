#!/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const ensurePackageIdsInPackageAliases = require('./ensurePackageIdsInPackageAliases.js');
const {HUB_ALIAS, PACKAGE_ALIASES, PACKAGE_DIRECTORIES, PACKAGE_ID_PREFIX, PACKAGE_VERSION_ID_PREFIX, PROJECT_PACKAGE_NAMES} = require('./constants.js');

async function getDependenciesBeforeTesting() {
    await ensurePackageIdsInPackageAliases();

    const PACKAGE_IDS = Object.values(PACKAGE_ALIASES);
    let possibleRequiredPackageVersionIds = new Set();
    let requiredPackageVersionIds = new Set();

    for(let package of PACKAGE_DIRECTORIES) {
        for(let i in package.dependencies) {
            let requiredPackage = package.dependencies[i].package;
            if(requiredPackage.startsWith(PACKAGE_VERSION_ID_PREFIX) && !PACKAGE_IDS.includes(requiredPackage)) {
                possibleRequiredPackageVersionIds.add(requiredPackage);
            } else if(
                !PROJECT_PACKAGE_NAMES.includes(requiredPackage) && 
                !requiredPackage.startsWith(PACKAGE_ID_PREFIX) && 
                !requiredPackage.startsWith(PACKAGE_VERSION_ID_PREFIX)
                ) {
                requiredPackageVersionIds.add(PACKAGE_ALIASES[requiredPackage]);
            } else if(requiredPackage.startsWith(PACKAGE_ID_PREFIX) && !PACKAGE_IDS.includes(requiredPackage)) {
                requiredPackageVersionIds.add(await getPackageIdFromDependency(package.dependencies[i]));
            }
        }
    }

    if(possibleRequiredPackageVersionIds.size > 0) {
        let queryConditionIds = Array.from(possibleRequiredPackageVersionIds).map(x => '\'' + x + '\'').join(', ');

        const {stdout, stderr} = await exec(
            `sfdx force:data:soql:query -q "SELECT SubscriberPackageVersionId, Package2Id, Package2.Name FROM Package2Version WHERE SubscriberPackageVersionId IN (${queryConditionIds})" -t -u ${HUB_ALIAS} --json`
        );
        if(stderr) {
            process.stderr.write(`Error in getDependenciesBeforeTesting(): ${stderr}`);
            process.exit(1);
        }
        
        let queryResult = JSON.parse(stdout).result.records;
        for(let result of queryResult) {
            if(PACKAGE_IDS.includes(result.Package2Id)) {
                possibleRequiredPackageVersionIds.delete(result.SubscriberPackageVersionId)
            }
        }

        for(let requiredPackage of possibleRequiredPackageVersionIds) {
            requiredPackageVersionIds.add(requiredPackage);
        }
    }

    process.stdout.write(`${Array.from(requiredPackageVersionIds).join(' ')}`);
}

async function getPackageIdFromDependency(dependency) {
    let versionNumber = dependency.versionNumber.split('.');
    let stdout;
    let stderr;

    let queryBase = `SELECT SubscriberPackageVersionId FROM Package2Version WHERE Package2Id = '${dependency.package}' AND MajorVersion = ${versionNumber[0]} AND MinorVersion = ${versionNumber[1]} AND PatchVersion = ${versionNumber[2]}`;
    if(dependency.versionNumber.includes('LATEST')) {
        ({stdout, stderr} = await exec(`sfdx force:data:soql:query -q "${queryBase} ORDER BY BuildNumber DESC LIMIT 1" -u ${HUB_ALIAS} -t --json`));
    } else if(dependency.versionNumber.includes('RELEASED')) {
        ({stdout, stderr} = await exec(
            `sfdx force:data:soql:query -q "${queryBase} AND IsReleased = true ORDER BY MinorVersion,PatchVersion LIMIT 1" -u ${HUB_ALIAS} -t --json`
        ));
    } else {
        ({stdout, stderr} = await exec(`sfdx force:data:soql:query -q "${queryBase} AND BuildNumber = ${versionNumber[3]} LIMIT 1" -u ${HUB_ALIAS} -t --json`));
    }

    if(stderr) {
        process.stderr.write(`Error in getPackageIdFromDependency(): ${stderr}`);
        process.exit(1);
    }
    return JSON.parse(stdout).result.records[0].SubscriberPackageVersionId;
}

module.exports.getDependenciesBeforeTesting = getDependenciesBeforeTesting;
