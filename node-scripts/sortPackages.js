#!/bin/env node

import getPackageNameFromDependency from './getPackageNameFromDependency.js';

export default async function sortPackages(packages, PACKAGE_DIRECTORIES) {
    const packagesWithDependencies = {};

    for(const packageDirectory of PACKAGE_DIRECTORIES) {
        if(packages.has(packageDirectory.package)) {
            const dependencies = [];
            if(packageDirectory.dependencies) {
                for(const dependentPackage of packageDirectory.dependencies) {
                    const packageName = await getPackageNameFromDependency(dependentPackage)
                    if(packages.has(packageName)) {
                        dependencies.push(packageName);
                    }
                }
            }
            packagesWithDependencies[packageDirectory.package] = dependencies;
        }
    }

    const sortedPackages = [];
    let rootNodes = getStartNodes(packagesWithDependencies);

    while(rootNodes.length) {
        sortedPackages.push(...rootNodes);
        const newRootNodes = [];
        for(const p in packagesWithDependencies) {
                if(rootNodes.includes(p)) {
                    delete packagesWithDependencies[p];
                } else {
                    packagesWithDependencies[p] = packagesWithDependencies[p].filter(element => {
                    return !rootNodes.includes(element);
                });
                if(!packagesWithDependencies[p].length) {
                    newRootNodes.push(p);
                }
            }
        }
        rootNodes = newRootNodes;
    }
    return sortedPackages;
}

function getStartNodes(nodeList) {
    const startNodes = [];
    for(const node in nodeList) {
        if(nodeList[node].length == 0) {
            startNodes.push(node);
        }
    }
    return startNodes;
}