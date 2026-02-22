#!/bin/env node

import fs from 'node:fs';
import { PACKAGE_DIRECTORIES } from './constants.js';

const FORCE_IGNORE_FILENAME = '.forceignore';

export function updateForceIgnore() {
    let sourceDirectories = [];
    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        sourceDirectories.push(packageDirectory.path);
    }

    let forceIgnore = fs.readFileSync(FORCE_IGNORE_FILENAME, {encoding: 'utf8'});
    let forceIgnoreLines = forceIgnore.split('\n');
    for(let i in forceIgnoreLines) {
        if(sourceDirectories.includes(forceIgnoreLines[i]) && (forceIgnoreLines[i].indexOf('#') == -1)) {
            forceIgnoreLines[i] = '#' + forceIgnoreLines[i];
        }
    }
    fs.writeFileSync(FORCE_IGNORE_FILENAME, forceIgnoreLines.join('\n'));
}

module.exports.updateForceIgnore = updateForceIgnore;