import { Uri, QuickPickItem, QuickPickOptions, window } from "vscode";
import { join, parse } from "path";
import { readdirSync } from "fs";
import { localTemplateRepoPath } from '../controllers/github-controller';
import { postError, showStatusMessage } from '../helper/common';

const fse = require("fs-extra");
const replace = require("replace-in-file");
const fs = require("fs");

export function getSelectedFile(uri: Uri, moveDown: boolean) {
    const selectedFileFullPath = parse(uri.fsPath);
    const selectedFileDir = selectedFileFullPath.dir;
    const currentFilename = selectedFileFullPath.name;
    const fileNumberRegex = /(.*?)-.*/;
    const fileNumber = currentFilename.match(fileNumberRegex);
    const currentUnitNumber: any = parseInt(fileNumber![1]);
    let newUnitNumber;
    if (moveDown) {
        newUnitNumber = currentUnitNumber + 1;
    } else {
        newUnitNumber = currentUnitNumber - 1;
    }
    renamePeerAndTargetUnits(selectedFileDir, currentFilename, newUnitNumber, currentUnitNumber)
}

export function renamePeerAndTargetUnits(selectedFileDir: any, currentFilename: string, newUnitNumber: any, currentUnitNumber: any) {
    const moduleUnits = [] = readdirSync(selectedFileDir);
    const existingUnit = moduleUnits.filter((unit) => unit.startsWith(newUnitNumber));
    const existingUnitName = existingUnit.toString().split('.')[0];
    renameUnit(selectedFileDir, existingUnitName, currentUnitNumber, newUnitNumber);
    renameUnit(selectedFileDir, currentFilename, newUnitNumber, currentUnitNumber);
}

export function renameUnit(selectedFileDir: any, currentFilename: string, newUnitNumber: any, currentUnitNumber: any) {
    const newFilename = currentFilename.replace(currentUnitNumber, newUnitNumber);
    const currentFilePath = join(selectedFileDir, `${currentFilename}.yml`);
    const newFilePath = join(selectedFileDir, `${newFilename}.yml`);
    fse.rename(currentFilePath, newFilePath);
    const currentIncludePath = join(selectedFileDir, 'includes', `${currentFilename}.md`);
    const newIncludePath = join(selectedFileDir, 'includes', `${newFilename}.md`);
    fse.rename(currentIncludePath, newIncludePath);
    const options = {
        files: newFilePath,
        from: currentFilename,
        to: newFilename,
    };
    const results = replace.sync(options);
}

export function addNewUnit(uri: Uri) {
    const constentTemplateDirectory = join(localTemplateRepoPath, "learn-scaffolding-main", "content-templates");
    try {
        let moduleTypes: QuickPickItem[] = [];
        fs.readdir(constentTemplateDirectory, function (err: string, files: any[]) {
            if (err) {
                return postError("Unable to scan directory: " + err);
            }
            files.forEach(function (file) {
                moduleTypes.push(file);
            });
            return showUnitSelector(uri, moduleTypes, constentTemplateDirectory);
        });
    } catch (error) {
        postError(error);
        showStatusMessage(error);
    }
}

export async function showUnitSelector(uri: Uri, moduleTypes: any[], contentTemplateDirectory: string) {
    const opts: QuickPickOptions = { placeHolder: 'Select unit type' };
    const ymlExtension = '.yml';
    const unitFilter = [] = moduleTypes.filter(file => file.endsWith(ymlExtension))
    const selection = await window.showQuickPick(unitFilter, opts);
    await copyUnitSelection(uri, selection, contentTemplateDirectory);
}

export function copyUnitSelection(uri: Uri, unitType: string, contentTemplateDirectory: string) {
    const selectedFileFullPath = uri.fsPath;
    const getUserInput = window.showInputBox({
        prompt: "Enter unit name.",
        validateInput: (userInput) =>
            userInput.length > 0 ? "" : "Please provide a unit name.",
    });
    getUserInput.then((unitName) => {
        if (!unitName) {
            return;
        }
        switch (unitType) {
            case 'default-knowledge-check-embedded.yml':
                fse.copySync(join(contentTemplateDirectory, unitType), join(selectedFileFullPath, `${unitName}.yml`));
                break;
            case 'default-knowledge-check-standalone-unit.yml':
                fse.copySync(join(contentTemplateDirectory, unitType), join(selectedFileFullPath, `${unitName}.yml`));
                break;
            case 'default-knowledge-check-unit.yml':
                fse.copySync(join(contentTemplateDirectory, unitType), join(selectedFileFullPath, `${unitName}.yml`));
                break;
            case 'default-unit.yml':
                fse.copySync(join(contentTemplateDirectory, unitType), join(selectedFileFullPath, `${unitName}.yml`));
                break;
        }
    });
}