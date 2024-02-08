# setup-wasmer
[![Tests](https://github.com/wasmerio/setup-wasmer/actions/workflows/tests.yml/badge.svg)](https://github.com/wasmerio/setup-wasmer/actions/workflows/tests.yml)


[GitHub action](https://github.com/features/actions) for setting up [Wasmer](https://wasmer.io).

## Features
* Always uses the latest stable Wasmer build
* Optionally lock onto a specific wasmer version
* Cross platform (Linux, Mac, and Windows)
* Automatically updates environment variables (So you can immediately start using Wasmer)
* Fully tested

## Usage
The easiest way to use this action is to use the latest stable version of
Wasmer. This can be done by using the following configuration:


```yaml
- name: Setup Wasmer
  uses: wasmerio/setup-wasmer@v3.1
```

Here is an example using a specific version of Wasmer:

```yaml
- name: Setup Wasmer
  uses: wasmerio/setup-wasmer@v3.1
  with:
    version: '4.2.5'
```

## Input
| name      | type     | description                              |
|-----------|----------|------------------------------------------|
| `version` | optional | specify the version of wasmer to install |


## Output
There is no output from this action

## Caveats
* Doesn't install Wasienv (Use the [Docker image instead](https://hub.docker.com/r/wasienv/wasienv))
