import { alias, gitHubID, defaultPrefix } from "../helper/user-settings";
import { basename, join } from 'path';
import { postInformation } from '../helper/common';

const replace = require("replace-in-file");
let learnRepo: string = defaultPrefix;
let author: string = gitHubID;
let msAuthor: string = alias;

export function generateBaseUid(modulePath: string, moduleName: any) {
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{moduleName}}/g,
    to: moduleName,
  };
  replace.sync(options);
  stubModuleReferences(modulePath, moduleName);
}

export function stubModuleReferences(modulePath: string, moduleName: any) {
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{moduleName}}/g,
    to: moduleName,
  };
  replace.sync(options);
  stubRepoReferences(modulePath);
}

function stubRepoReferences(modulePath: string) {
  if (!learnRepo) {
    learnRepo = "learn";
  }
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{learnRepo}}/g,
    to: learnRepo,
  };
  replace.sync(options);
  stubGithubIdReferences(modulePath);
}

function stubGithubIdReferences(modulePath: string) {
  if (!author) {
    author = "{{githubUsername}}";
  }
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{githubUsername}}/g,
    to: author,
  };
  replace.sync(options);
  stubGithubAuthorReferences(modulePath);
}

function stubGithubAuthorReferences(modulePath: string) {
  if (!msAuthor) {
    msAuthor = "{{msUser}}";
  }
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{msUser}}/g,
    to: msAuthor,
  };
  replace.sync(options);
  stubDateReferences(modulePath);
}

function stubDateReferences(modulePath: string) {
  let date: any = new Date(Date.now());
  date = date.toLocaleDateString();
  const options = {
    files: `${modulePath}/*.yml`,
    from: /{{msDate}}/g,
    to: date,
  };
  replace.sync(options);
  stubUnitReferences(modulePath);
}

function stubUnitReferences(modulePath: string) {
  const fs = require("fs");
  fs.readdir(modulePath, function (err: string, files: any[]) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    files.forEach(function (file) {
      let unitFilePath = join(modulePath, file);
      let unitName = basename(unitFilePath.replace('.yml', ''));
      const options = {
        files: `${modulePath}/${unitName}.yml`,
        from: /{{unitName}}/g,
        to: unitName,
      };
      replace.sync(options);
    });
    const moduleName = basename(modulePath);
    postInformation(`Successfully created : ${moduleName}`);
  });
}