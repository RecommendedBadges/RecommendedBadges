#!/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function createScratchOrg() {
    try {
        ({stdout, stderr} = await exec(
            `sf org create scratch -f ${process.env.SCRATCH_ORG_DEFINITION_FILE} -v ${process.env.HUB_ALIAS} -d -a ${process.env.TEST_ORG_ALIAS} --no-track-source -w ${process.env.WAIT_TIME} -y 1`,
            { maxBuffer: 1024 * 5000 }
        ));

        if(stdout) {
            process.stdout.write(`Created scratch org: ${stdout}`);
        } else if(stderr) {
            process.stderr.write(`Error in createScratchOrg(): ${stderr}`);
            process.exit(1);
        }
    } catch(e) {
        if(e.message.endsWith('Creating Scratch Org... done')) {
            while(true) {
                ({stdout, stderr} = await exec(`sf org list --json --skip-connection-status`));
                if((stdout.result.scratchOrgs.length > 0) && (stdout.result.scratchOrgs[0].orgName === 'TestOrg')) {
                    process.stdout.write(`Created scratch org: ${stdout}`);
                    break;
                } else {
                    process.stdout.write(`Waiting for scratch org to be created...`);
                    await exec('sleep 5000');
                }
            }
        } else {
            process.stderr.write(`Error in createScratchOrg(): ${e}`);
        }
    }
}

module.exports.createScratchOrg = createScratchOrg;