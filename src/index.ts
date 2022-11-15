/**
 * @fileoverview Setup Wasmer
 */

//Imports
import got from 'got';
import {getInput, addPath, debug, endGroup, exportVariable, info, setFailed, startGroup} from '@actions/core';
import {createWriteStream} from 'fs';
import {exec} from '@actions/exec';
import {homedir} from 'os';
import {join} from 'path';
import {path} from 'temp';
import {promisify} from 'util';
import {pipeline as pipelineCB} from 'stream';

//Promisify pipes
const pipeline = promisify(pipelineCB);

const main = async () =>
{
  //Get if the host is Windows or not
  const version = getInput("version");
  const isWindows = process.platform == 'win32';

  //Create a temporary file to store the installer
  const tmp = path({
    suffix: isWindows ? '.ps1' : '.sh'
  });

  debug(`Using ${tmp} as temporary path.`);

  //Download the latest installer
  startGroup('Download the installer.');
  const progressHandler = (data: {transferred: number, total: number, percent: number}) =>
  {
    //Round
    const transferred = Math.round(data.transferred / 1000);
    const total = Math.round(data.total / 1000);
    const percent = Math.round(data.percent * 100);

    //Log
    info(`Downloaded ${transferred}K out of ${total}K (${percent}%)`);
  };
  await pipeline(
    got.stream(isWindows ? 'https://win.wasmer.io' : 'https://get.wasmer.io').on('downloadProgress', progressHandler),
    createWriteStream(tmp, {
      mode: 0o655
    })
  );
  endGroup();

  info('Downloaded installer.');
  const exec_input = version.length == 0 ? [tmp] : [tmp, version];
  const exec_shell = isWindows ? 'pwsh' : 'sh';
  info(`${exec_shell} ${exec_input} -- install for version ${version}`);

  //Execute the installer
  startGroup('Execute the installer.');
  const exitCode = await exec(exec_shell, exec_input);

  if (exitCode != 0)
  {
    //Fail the step
    setFailed(`Installer failed! (Exit code ${exitCode})`);

    //Crash
    process.exit(1);
  }
  endGroup();

  info(`Executed installer. (Exit code ${exitCode})`);

  //Update environment variables
  const wasmerDir = join(homedir(), '.wasmer');
  debug(`Using ${wasmerDir} as Wasmer directory.`);
  if (isWindows)
  {
    exportVariable('WASMER_DIR', wasmerDir);
    addPath(join(wasmerDir, 'bin'));
  }
  else
  {
    exportVariable('WASMER_DIR', wasmerDir);
    exportVariable('WASMER_CACHE_DIR', join(wasmerDir, 'cache'));
    addPath(join(wasmerDir, 'bin'));
    addPath(join(wasmerDir, 'globals/wapm_packages/.bin'));
  }

  info('Updated environment variables.');
};

main().catch(error =>
{
  throw error;
});