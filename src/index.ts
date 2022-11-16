//Imports
import got from "got";
import {
  getInput,
  addPath,
  debug,
  endGroup,
  exportVariable,
  info,
  setFailed,
  startGroup,
} from "@actions/core";
import { createWriteStream } from "fs";
import { exec } from "@actions/exec";
import { homedir } from "os";
import { join } from "path";
import { path } from "temp";
import { promisify } from "util";
import { pipeline as pipelineCB } from "stream";
import tar from "tar";
import fs from "fs";

//Promisify pipes
const pipeline = promisify(pipelineCB);

const main = async () => {
  //Get the version
  const version = getInput("version");
  //Get if the host is Windows or not
  const isWindows = process.platform == "win32";

  //Create a temporary file to store the installer
  const tmp = path({
    suffix: isWindows ? ".ps1" : ".sh",
  });

  debug(`Using ${tmp} as temporary path.`);

  //Download the latest installer
  startGroup("Download the installer.");
  const progressHandler = (data: {
    transferred: number;
    total: number;
    percent: number;
  }) => {
    //Round
    const transferred = Math.round(data.transferred / 1000);
    const total = Math.round(data.total / 1000);
    const percent = Math.round(data.percent * 100);

    //Log
    info(`Downloaded ${transferred}K out of ${total}K (${percent}%)`);
  };
  await pipeline(
    got
      .stream(isWindows ? "https://win.wasmer.io" : "https://get.wasmer.io")
      .on("downloadProgress", progressHandler),
    createWriteStream(tmp, {
      mode: 0o655,
    })
  );
  endGroup();

  info("Downloaded installer.");
  const exec_input = version.length == 0 ? [tmp] : [tmp, version];
  const exec_shell = isWindows ? "pwsh" : "sh";
  info(`${exec_shell} ${exec_input} -- install for version ${version}`);

  //Execute the installer
  startGroup("Execute the installer.");
  const exitCode = await exec(exec_shell, exec_input);

  if (exitCode != 0) {
    //Fail the step
    setFailed(`Installer failed! (Exit code ${exitCode})`);

    //Crash
    process.exit(1);
  }
  endGroup();

  info(`Executed installer. (Exit code ${exitCode})`);

  const wasmerDir = join(homedir(), ".wasmer");

  if (isWindows) {
    startGroup("Download and Add WAPM-Cli to the PATH.");

    //Get the wapm version
    const wapmVersion = getInput("wapm_version");

    const tmpWapm = path({
      suffix: ".tar.gz",
    });

    //Download the latest installer
    const progressHandler = (data: {
      transferred: number;
      total: number;
      percent: number;
    }) => {
      //Round
      const transferred = Math.round(data.transferred / 1000);
      const total = Math.round(data.total / 1000);
      const percent = Math.round(data.percent * 100);

      //Log
      info(`Downloaded ${transferred}K out of ${total}K (${percent}%)`);
    };

    await pipeline(
      got
        .stream(
          `https://github.com/wasmerio/wapm-cli/releases/download/v0.5.9/wapm-cli-windows-amd64.tar.gz`
        )
        .on("downloadProgress", progressHandler),
      createWriteStream(tmpWapm, {
        mode: 0o655,
      })
    );
    const currentDir = process.cwd();
    const wasmerBinDir = join(homedir(), ".wasmer", "bin");
    const wapmExecutableDir = join(currentDir, "bin");

    tar
      .x({
        file: tmpWapm,
        cwd: currentDir,
      })
      .then((file) => {
        console.log(file);
        fs.copyFile(
          join(wapmExecutableDir, "wapm.exe"),
          join(wasmerBinDir, "wapm.exe"),
          (err) => {
            if (err) throw err;
            console.log("WAPM-Cli was copied to Wasmer bin directory.");
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
    endGroup();
  }

  //Update environment variables
  debug(`Using ${wasmerDir} as Wasmer directory.`);
  if (isWindows) {
    exportVariable("WASMER_DIR", wasmerDir);
    addPath(join(wasmerDir, "bin"));
  } else {
    exportVariable("WASMER_DIR", wasmerDir);
    exportVariable("WASMER_CACHE_DIR", join(wasmerDir, "cache"));
    addPath(join(wasmerDir, "bin"));
    addPath(join(wasmerDir, "globals/wapm_packages/.bin"));
  }

  // if is windows then download WAPM from releases and copy to wasmerDir/bin and add to path and [line 73]

  info("Updated environment variables.");
};

main().catch((error) => {
  throw error;
});
