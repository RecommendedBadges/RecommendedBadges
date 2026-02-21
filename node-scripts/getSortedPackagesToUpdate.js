const util = require('util');
const exec = util.promisify(require('child_process').exec);

const sortPackages = require('./sortPackages.js');
const ensurePackageIdsInPackageAliases = require('./ensurePackageIdsInPackageAliases.js');
const getPackageNameFromDependency = require('./getPackageNameFromDependency.js');
const {PACKAGE_DIRECTORIES} = require('./constants.js');

const OUTPUT_FILENAME = '/tmp/artifacts/packagesToUpdate.txt';
const BASE_BRANCH = 'main';

async function getChangedPackageDirectories() {
    let changedFiles = [];
    let changedPackageDirectories = new Set();
    try {
        const {stdout, stderr} = await exec(`git diff origin/${BASE_BRANCH} --name-only`);
        if(stderr) {
            process.stderr.write(`Error in getChangedPackageDirectories(): ${stderr}`);
            process.exit(1);
        }
        changedFiles = stdout.split('\n');
        for(let changedFile of changedFiles) {
            if(changedFile.indexOf('/') != -1) {
                changedPackageDirectories.add(changedFile.substring(0, changedFile.indexOf('/')));
            }
        }
    } catch(err) {
        process.stderr.write(`Error in getChangedPackageDirectories(): ${err}`);
        process.exit(1);
    }
    return changedPackageDirectories;
}

async function getPackagesToUpdate(changedPackageDirectories) {
    let packagesToUpdate = new Set();
    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        if(changedPackageDirectories.has(packageDirectory.path) && packageDirectory.package) {
            packagesToUpdate.add(packageDirectory.package);
        }
    }

    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        process.stdout.write(`packageDirectory versionNumber: ${packageDirectory.versionNumber}\n`);
        if(packageDirectory.dependencies) {
            for(let dependentPackage of packageDirectory.dependencies) {
                process.stdout.write(`dependentPackage: ${JSON.stringify(dependentPackage)}\n`);
                let packageName = await getPackageNameFromDependency(dependentPackage);
                if(packageName && packagesToUpdate.has(packageName)) {
                    packagesToUpdate.add(packageDirectory.package);
                }
            }
        }
    }
    return packagesToUpdate;
}

async function getSortedPackagesToUpdate() {
    let changedPackageDirectories = await getChangedPackageDirectories();
    await ensurePackageIdsInPackageAliases();
    let packagesToUpdate = await getPackagesToUpdate(changedPackageDirectories);
    let sortedPackagesToUpdate = await sortPackages(packagesToUpdate, PACKAGE_DIRECTORIES);
    process.stdout.write(sortedPackagesToUpdate.join(' '));
    fs.writeFileSync(OUTPUT_FILENAME, sortedPackagesToUpdate.join('\n'));
    process.exit(1);
}

module.exports.getSortedPackagesToUpdate = getSortedPackagesToUpdate;