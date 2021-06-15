# Setup Wasmer Action
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Cloud-CNC/setup-wasmer/Tests?label=Tests&style=flat-square)](https://github.com/Cloud-CNC/setup-wasmer/actions/workflows/tests.yml)

[GitHub action](https://github.com/features/actions) for setting up [Wasmer](https://wasmer.io). Works well with [cloud-cnc/wapm-publish](https://github.com/cloud-cnc/wapm-publish).

## Features
* Always uses the latest stable Wasmer build
* Cross platform (Linux, Mac, and Windows)
* Automatically updates environment variables (So you can immediately start using Wasmer)
* Fully tested

## Caveats
* Doesn't install Wasienv (Use the [Docker image instead](https://hub.docker.com/r/wasienv/wasienv))

## Usage
```yaml
- name: Setup Wasmer
  uses: cloud-cnc/setup-wasmer@v1

- name: Publish to WAPM
  uses: cloud-cnc/wapm-publish@v1
  with:
    username: ${{ secrets.WAPM_USERNAME }}
    password: ${{ secrets.WAPM_PASSWORD }}
```

## Input
There is no input for this action

## Output
There is no output from this action