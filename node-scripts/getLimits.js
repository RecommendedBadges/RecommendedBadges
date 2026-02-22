#!/bin/env node

import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);

const SCRATCH_ORG_LIMIT = 'DailyScratchOrgs';
const PACKAGE_VERSION_LIMIT = 'Package2VersionCreates';
const PACKAGE_VERSION_NO_VALIDATION_LIMIT = 'Package2VersionCreatesWithoutValidation';

export default async function getLimits() {
    try {
        const {stdout, stderr} = await exec(`sf org list limits -o ${process.env.HUB_ALIAS} --json`);
        if(stderr) {
            process.stderr.write(`Error in getLimits(): ${stderr}`);
            process.exit(1);
        }
        
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
            "remaining-scratch-orgs": remainingScratchOrgs,
            "remaining-packages": remainingPackageVersions,
            "remaining-packages-without-validation": remainingPackageVersionsNoValidation
        }

        return limits;
    } catch(err) {
        process.stderr.write(`Error in getLimits(): ${err}`);
        process.exit(1);
    }
}