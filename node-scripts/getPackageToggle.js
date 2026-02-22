#!/bin/env node
import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);

const USERNAME = process.env.CIRCLE_USERNAME || 'learnbenlearn';
const REPO = process.env.CIRCLE_PROJECT_REPONAME || 'RecommendedBadges';
const PULL_REQUEST_NUMBER = process.env.CIRCLE_PULL_REQUEST ? process.env.CIRCLE_PULL_REQUEST.substring(process.env.CIRCLE_PULL_REQUEST.lastIndexOf('/')+1) : 115;
const PACKAGE_LABEL = process.env.PACKAGE_LABEL;

export async function getPackageToggle() {
    try {
        const {stdout, stderr} = await exec(`gh api -H "Accept: application/vnd.github+json" /repos/${USERNAME}/${REPO}/pulls/${PULL_REQUEST_NUMBER}`);
        if(stderr) {
            process.stderr.write(`Error in getPackageToggle(): ${stderr}`);
            process.exit(1);
        }
        
        let labels = JSON.parse(stdout).labels;
        if(labels.length != 0) {
            for(let label of labels) {
                if(label.name === PACKAGE_LABEL) {
                    return true;
                }
            }
        }
        return false;
    } catch(err) {
        console.error(err);
    }
}

module.exports = getPackageToggle;