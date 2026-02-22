#!/bin/env node

import fs from 'node:fs';
import getLimits from './getLimits.js';
import getPackageToggle from './getPackageToggle.js';

const OUTPUT_FILENAME = 'parameters.json';

export default async function populateParameters() {
    let parameters = await getLimits();
    parameters["create-packages"] = await getPackageToggle();
    fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(parameters));
}