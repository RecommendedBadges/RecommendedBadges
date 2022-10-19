#!/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const SCRATCH_ORG_LIMIT = 'DailyScratchOrgs';
const PACKAGE_VERSION_LIMIT = 'Package2VersionCreates';
const PACKAGE_VERSION_NO_VALIDATION_LIMIT = 'Package2VersionCreatesWithoutValidation';

async function getLimits() {
    try {
        const {stdout, stderr} = await exec(`sfdx force:limits:api:display -u ${process.env.HUB_ALIAS} --json`);
        if(stderr) {
            process.stderr.write(`Error in getLimits(): ${stderr}`);
            process.exit(1);
        } else {
            let jsonResponse = JSON.parse(stdout);
            let limitList = jsonResponse.result;
            let remainingScratchOrgs;
            let remainingPackageVersions;
            let remainingPackageVersionsNoValidation;

            for(let limit of limitList) {
                switch(limit.name) {
                    case SCRATCH_ORG_LIMIT:
                        remainingScratchOrgs = limit.remaining;
                        break;
                    case PACKAGE_VERSION_LIMIT:
                        remainingPackageVersions = limit.remaining;
                    case PACKAGE_VERSION_NO_VALIDATION_LIMIT:
                        remainingPackageVersionsNoValidation = limit.remaining;
                }
            }

            let limits = {
                "REMAINING_SCRATCH_ORGS": remainingScratchOrgs,
                "REMAINING_PACKAGES": remainingPackageVersions,
                "REMAINING_PACKAGES_WITHOUT_VALIDATION": remainingPackageVersionsNoValidation
            }

            return limits;
        }
    } catch(err) {
        process.stderr.write(`Error in getLimits(): ${err}`);
        process.exit(1);
    }
}

module.exports = getLimits;