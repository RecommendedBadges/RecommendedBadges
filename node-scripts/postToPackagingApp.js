import axios from 'axios';
import fs from 'node:fs';
import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);

const SORTED_PACKAGES_TO_UPDATE_FILE = '/tmp/artifacts/packagesToUpdate.txt';
const PULL_REQUEST_URL = process.env.CIRCLE_PULL_REQUEST;
const LAMBDA_INVOKE_COMMAND = 'aws lambda invoke --function-name PackagingLambda --invocation-type Event --no-cli-auto-prompt';

export default async function postToPackagingApp() {
    try {
        const pullRequestNumber = PULL_REQUEST_URL.substring(PULL_REQUEST_URL.lastIndexOf('/') + 1);
        const sortedPackagesToUpdate = fs.readFileSync(
            SORTED_PACKAGES_TO_UPDATE_FILE,
            {
                "encoding": "utf8"
            }
        ).split('\n');

        const {stdout, stderr} = await exec(`${LAMBDA_INVOKE_COMMAND} --payload ${JSON.stringify({
            pullRequestNumber,
            sortedPackagesToUpdate
        })}`);
        if(stderr) {
            process.stderr.write(`Error in getLimits(): ${stderr}`);
            process.exit(1);
        }
        console.log(`Job ID: ${stdout}`);
    } catch(err) {
        process.stderr.write(`Error in postToPackagingApp(): ${err}`);
        process.exit(1);
    }
}
