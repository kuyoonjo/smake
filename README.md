<!-- [![Build Status](https://travis-ci.org/kuyoonjo/smake.svg?branch=master)](https://travis-ci.org/kuyoonjo/smake.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/kuyoonjo/smake/badge.svg?branch=master)](https://coveralls.io/github/kuyoonjo/smake?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT) -->

# 交叉编译系统

## 依赖
- [LLVM >= 11](https://github.com/llvm/llvm-project/releases)
- [Nodejs >= 11.15](https://npm.taobao.org/mirrors/node)
- [Ninja >= 1.10](https://github.com/ninja-build/ninja/releases)

## 安装
```
npm i -g smake
```

## 功能

- [x] macOS 下编译 macOS
- [x] macOS 下编译 Linux
- [x] macOS 下编译 Windows
- [ ] Windows 下编译 macOS
- [x] Windows 下编译 Linux
- [x] Windows 下编译 Windows

## 设置

```bash
# LLVM 可执行文件目录前缀。
# 如果已在 PATH 中可以不设置。
export SMAKE_LLVM_PREFIX="/opt/homebrew/opt/llvm/bin/"

# Clang 目录
# 仅在 useClangHeaders = true 时需要
export SMAKE_LLVM_CLANG_PATH="/opt/homebrew/opt/llvm/lib/clang/11.1.0"
```

> Windows SDK 设置
```bash
# _MVC_VER 版本号
export SMAKE_LLVM_MSVC_VERSION=1928
# Windows Kits 10 版本号
export SMAKE_LLVM_WINDOWS_KITS_10_VERSION=10.0.19041.0

# MSVC 目录。Windows 下可以不设置。如果设置，请使用 / 代替 \ 。如：C:/Program Files (x86)/Microsoft Visual Studio/2019/Community/VC/Tools/MSVC/14.28.29910
export SMAKE_LLVM_MSVC_PATH="/opt/sysroots/win32/Program Files (x86)/Microsoft Visual Studio/2019/Community/VC/Tools/MSVC/14.28.29910"
# Windows Kits 10 位置。Windows 下可以不设置。如果设置，请使用 / 代替 \ 。如：C:/Program Files (x86)/Windows Kits/10
export SMAKE_LLVM_WINDOWS_KITS_10_PATH="/opt/sysroots/win32/Program Files (x86)/Windows Kits/10"
```

> Linux SDK 设置
```bash
# 规则为设置 SMAKE_LLVM_SYSROOT_${编译目标大写} 至 sysroot 目录
# aarch64-linux-gnu
export SMAKE_LLVM_SYSROOT_AARCH64_LINUX_GNU=/opt/sysroots/ubuntu14.04-aarch64-linux-gnu
# x86_64-linux-gnu
export SMAKE_LLVM_SYSROOT_X86_64_LINUX_GNU=/opt/sysroots/ubuntu14.04-x86_64-linux-gnu
# arm-linux-gnueabihf
export SMAKE_LLVM_SYSROOT_ARM_LINUX_GNUEABIHF=/opt/sysroots/ubuntu14.04-arm-linux-gnueabihf
```

### Nodejs 下载镜像设置（官方下载太慢）（可选）

```bash
# 使用淘宝镜像
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node
```

## 使用方法
在项目目录下创建 `xmake.js` 文件。
> Linux
```js
const { LLVM_Linux } = require('smake');

class linux_executable extends LLVM_Linux {
  target = 'aarch-linux-gnu';
  files = ['src/main.c'];
}

module.exports = {
  targets: [
    linux_executable,
  ],
};
```
运行 `smake build` 编译。

> Windows
```js
const { LLVM_Win32 } = require('smake');

class win32_executable extends LLVM_Win32 {
  files = ['src/main.c'];
}

module.exports = {
  targets: [
    win32_executable,
  ],
};
```
运行 `smake build` 编译。

> macOS
```js
const { LLVM_Darwin } = require('smake');

class darwin_executable extends LLVM_Darwin {
  ARCH = 'arm64';
  files = ['src/main.c'];
}

module.exports = {
  targets: [
    darwin_executable,
  ],
};
```
运行 `smake build` 编译。

更多请查看 `examples` 目录。