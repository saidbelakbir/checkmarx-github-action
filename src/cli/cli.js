const fs = require("fs")
const path = require('path')
const utils = require('../utils/utils.js')
const core = require('@actions/core')
const exec = require('@actions/exec')
const inputs = require('../github/inputs')
const isWin = process.platform === "win32" || process.platform === "win64";
const DOWNLOAD_DOMAIN = "https://download.checkmarx.com"
const DOWNLOAD_COMMON_PATH = "Plugins/CxConsolePlugin-"
const CLI_DOWNLOAD_URLS = [
    DOWNLOAD_DOMAIN + "/8.6.0/" + DOWNLOAD_COMMON_PATH + "8.60.3.zip",//0
    DOWNLOAD_DOMAIN + "/8.7.0/" + DOWNLOAD_COMMON_PATH + "8.70.4.zip",//1
    DOWNLOAD_DOMAIN + "/8.8.0/" + DOWNLOAD_COMMON_PATH + "8.80.2.zip",//2
    DOWNLOAD_DOMAIN + "/8.9.0/" + DOWNLOAD_COMMON_PATH + "8.90.2.zip",//3
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "9.00.1.zip",//4
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "9.00.2.zip",//5
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.1.12.zip",//6
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.3.zip",//7
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.7.zip",//8
    DOWNLOAD_DOMAIN + "/9.0.0/" + DOWNLOAD_COMMON_PATH + "2020.2.11.zip",//9
]
const CLI_FOLDER_NAME = "cxcli"

function getCliDownloadUrl(cxVersion) {
    if (isValidVersion(cxVersion)) {
        switch (cxVersion) {
            case "2020":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2.11":
                return CLI_DOWNLOAD_URLS[9]
            case "2020.2.7":
                return CLI_DOWNLOAD_URLS[8]
            case "2020.2.3":
                return CLI_DOWNLOAD_URLS[7]
            case "2020.1":
                return CLI_DOWNLOAD_URLS[6]
            case "2020.1.12":
                return CLI_DOWNLOAD_URLS[6]
            case "9.0":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.0":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.2":
                return CLI_DOWNLOAD_URLS[5]
            case "9.0.1":
                return CLI_DOWNLOAD_URLS[4]
            case "8.9":
                return CLI_DOWNLOAD_URLS[3]
            case "8.9.0":
                return CLI_DOWNLOAD_URLS[3]
            case "8.8":
                return CLI_DOWNLOAD_URLS[2]
            case "8.8.0":
                return CLI_DOWNLOAD_URLS[2]
            case "8.7":
                return CLI_DOWNLOAD_URLS[1]
            case "8.7.0":
                return CLI_DOWNLOAD_URLS[1]
            case "8.6":
                return CLI_DOWNLOAD_URLS[0]
            case "8.6.0":
                return CLI_DOWNLOAD_URLS[0]
            default:
                if (cxVersion.startsWith("2020")) {
                    return CLI_DOWNLOAD_URLS[9]
                } else if (cxVersion.startsWith("9.0")) {
                    return CLI_DOWNLOAD_URLS[9]
                } else if (cxVersion.startsWith("8.9")) {
                    return CLI_DOWNLOAD_URLS[3]
                } else if (cxVersion.startsWith("8.8")) {
                    return CLI_DOWNLOAD_URLS[2]
                } else if (cxVersion.startsWith("8.7")) {
                    return CLI_DOWNLOAD_URLS[1]
                } else if (cxVersion.startsWith("8.6")) {
                    return CLI_DOWNLOAD_URLS[0]
                } else {
                    return CLI_DOWNLOAD_URLS[3]
                }
        }
    } else {
        if (cxVersion.startsWith("2020")) {
            return CLI_DOWNLOAD_URLS[9]
        } else if (cxVersion.startsWith("9.0")) {
            return CLI_DOWNLOAD_URLS[9]
        } else if (cxVersion.startsWith("8.9")) {
            return CLI_DOWNLOAD_URLS[3]
        } else if (cxVersion.startsWith("8.8")) {
            return CLI_DOWNLOAD_URLS[2]
        } else if (cxVersion.startsWith("8.7")) {
            return CLI_DOWNLOAD_URLS[1]
        } else if (cxVersion.startsWith("8.6")) {
            return CLI_DOWNLOAD_URLS[0]
        } else {
            return CLI_DOWNLOAD_URLS[3]
        }
    }
}

function isValidVersion(version) {
    return utils.isValidString(version) && (
        version.startsWith("2020") ||
        version.startsWith("9.0") ||
        version.startsWith("8.9") ||
        version.startsWith("8.8") ||
        version.startsWith("8.7") ||
        version.startsWith("8.6")
    )
}

async function downloadCli(cxVersion, skipIfFail) {
    if (utils.isValidString(cxVersion)) {
        let cliDownloadUrl = getCliDownloadUrl(cxVersion)
        if (cliDownloadUrl) {
            core.setOutput("cxCliDownloadUrl", cliDownloadUrl)
            let versionFileName = utils.getLastString(cliDownloadUrl).replace(".zip", "")
            if (versionFileName) {
                core.setOutput("cxCliVersionFileName", versionFileName)
                core.info("[START] Download Checkmarx CLI from " + cliDownloadUrl + "...")
                const zipFileName = CLI_FOLDER_NAME + ".zip";
                const cliExists = fs.existsSync(CLI_FOLDER_NAME)
                if (!cliExists) {
                    core.info("Checkmarx CLI does not exist in the path. Trying to download...\n")
                    await exec.exec("curl -s " + cliDownloadUrl + " -L -o " + zipFileName)
                    if (utils.is8Version(cxVersion)) {
                        if (fs.existsSync(zipFileName)) {
                            await exec.exec("unzip -q " + zipFileName)
                        } else {
                            core.info("Checkmarx CLI Zip File '" + zipFileName + "' does not exists")
                        }
                    } else {
                        if (fs.existsSync(zipFileName)) {
                            await exec.exec("unzip -q " + zipFileName + " -d " + CLI_FOLDER_NAME)
                        } else {
                            core.info("Checkmarx CLI Zip File '" + zipFileName + "' does not exists")
                        }
                    }
                    if (fs.existsSync(zipFileName)) {
                        await exec.exec("rm -rf " + zipFileName)
                    } else {
                        core.info("Checkmarx CLI Zip File '" + zipFileName + "' does not exists")
                    }
                } else {
                    core.info("No need to download Checkmarx CLI because it already exists in the path with name '" + CLI_FOLDER_NAME + "'\n")
                }

                if (!cliExists) {
                    if (utils.is8Version(cxVersion)) {
                        if (fs.existsSync(versionFileName)) {
                            await exec.exec("mv " + versionFileName + " " + CLI_FOLDER_NAME)
                        } else {
                            core.info("Checkmarx CLI Version Folder '" + versionFileName + "' does not exists")
                        }
                        const examplesFolder = "./" + CLI_FOLDER_NAME + "/Examples"
                        if (fs.existsSync(examplesFolder)) {
                            await exec.exec("rm -rf " + examplesFolder)
                        } else {
                            core.info("Checkmarx CLI Examples Folder '" + examplesFolder + "' does not exists")
                        }
                    }
                }
                if (isWin) {
                    const runWindows = "." + path.sep + CLI_FOLDER_NAME + path.sep + "runCxConsole.cmd"
                    if (fs.existsSync(runWindows)) {
                        await exec.exec("chmod +x " + runWindows)
                    }
                } else {
                    const runLinux = "." + path.sep + CLI_FOLDER_NAME + path.sep + "runCxConsole.sh"
                    if (fs.existsSync(runLinux)) {
                        await exec.exec("chmod +x " + runLinux)
                    }
                }

                await exec.exec("ls -la")

                core.info("[END] Download Checkmarx CLI...\n")
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    } else {
        return inputs.coreError("Invalid version : " + cxVersion, skipIfFail)
    }
}

function getFolderName() {
    return CLI_FOLDER_NAME
}

function getCliDownloadUrls() {
    return CLI_DOWNLOAD_URLS
}

function getCliStartCommand() {
    if (isWin) {
        return getFolderName() + path.sep + "runCxConsole.cmd "
    } else {
        return getFolderName() + path.sep + "runCxConsole.sh "
    }
}

async function executeCommand(command, skipIfFail) {
    if (utils.isValidString(command)) {
        core.setOutput("cxCmdExecuted", command)
        try {
            await exec.exec(command)
            return true
        } catch (e) {
            return inputs.coreError( "Failed to execute command : " + e.message, skipIfFail)
        }
    } else {
        core.info("Invalid command string : " + command)
        return false
    }
}

module.exports = {
    getCliDownloadUrl: getCliDownloadUrl,
    downloadCli: downloadCli,
    getFolderName: getFolderName,
    getCliDownloadUrls: getCliDownloadUrls,
    getCliStartCommand: getCliStartCommand,
    executeCommand: executeCommand,
    isValidVersion: isValidVersion
}