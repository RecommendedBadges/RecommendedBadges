#!/bin/env node
import * as fs from 'node:fs';

export const HUB_ALIAS = process.env.HUB_ALIAS;
const SFDX_PROJECT_JSON = JSON.parse(fs.readFileSync('./sfdx-project.json'));
export const PACKAGE_ALIASES = SFDX_PROJECT_JSON.packageAliases;
export const PACKAGE_ALIAS_DELIMITER = '@';
export const PACKAGE_DIRECTORIES = SFDX_PROJECT_JSON.packageDirectories;
export const PACKAGE_ID_PREFIX = '0Ho';
export const PACKAGE_IDS_TO_ALIASES = {};
export const PACKAGE_VERSION_ID_PREFIX = '04t';
export const PROJECT_PACKAGE_NAMES = [];

for (const alias in PACKAGE_ALIASES) {
    PACKAGE_IDS_TO_ALIASES[PACKAGE_ALIASES[alias]] = alias;
}

for (const packageDirectory of PACKAGE_DIRECTORIES) {
    if (packageDirectory.package) {
        PROJECT_PACKAGE_NAMES.push(packageDirectory.package);
    }
}