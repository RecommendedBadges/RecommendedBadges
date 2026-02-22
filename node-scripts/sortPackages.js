#!/bin/env node

import getPackageNameFromDependency from './getPackageNameFromDependency.js';

export default async function sortPackages(packages, PACKAGE_DIRECTORIES) {
    let packagesWithDependencies = {};

    for(let packageDirectory of PACKAGE_DIRECTORIES) {
        if(packages.has(packageDirectory.package)) {
            let dependencies = [];
            if(packageDirectory.dependencies) {
                for(let dependentPackage of packageDirectory.dependencies) {
                    let packageName = await getPackageNameFromDependency(dependentPackage)
                    if(packages.has(packageName)) {
                        dependencies.push(packageName);
                    }
                }
            }
            packagesWithDependencies[packageDirectory.package] = dependencies;
        }
    }

    let sortedPackages = [];
    let rootNodes = getStartNodes(packagesWithDependencies);

    while(rootNodes.length) {
        sortedPackages.push(...rootNodes);
        let newRootNodes = [];
        for(let p in packagesWithDependencies) {
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
    let startNodes = [];
    for(let node in nodeList) {
        if(nodeList[node].length == 0) {
            startNodes.push(node);
        }
    }
    return startNodes;
}