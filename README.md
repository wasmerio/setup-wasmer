# Setup Wasmer Action
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Cloud-CNC/setup-wasmer/Tests?label=Tests&style=flat-square)](https://github.com/Cloud-CNC/setup-wasmer/actions/workflows/tests.yml)

[GitHub action](https://github.com/features/actions) for setting up [Wasmer](https://wasmer.io)

## Features
* Always uses the latest Wasmer build
* Cross platform (Linux, Mac, and Windows)
* Automatically updates environment variables (So you can immediately start using Wasmer)

## Caveats
* Doesn't install Wasienv (Use the [Docker image instead](https://hub.docker.com/r/wasienv/wasienv))

## Usage
```yaml
- name: Setup Wasmer
  uses: cloud-cnc/setup-wasmer@v1
```

## I/O
There is no input nor output from this action