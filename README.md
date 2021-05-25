<!-- [![Build Status](https://travis-ci.org/kuyoonjo/smake.svg?branch=master)](https://travis-ci.org/kuyoonjo/smake.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/kuyoonjo/smake/badge.svg?branch=master)](https://coveralls.io/github/kuyoonjo/smake?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT) -->

# 交叉编译系统
- LLVM >= 11
- Nodejs >= 11.15
- Ninja >= 1.10


## Env

```
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node

export SMAKE_LLVM_PREFIX=""

export SMAKE_LLVM_MSVC_VERSION=1928
export SMAKE_LLVM_WINDOWS_KITS_10_VERSION=10.0.19041.0

export SMAKE_LLVM_MSVC_PATH="C:/Program Files (x86)/Microsoft Visual Studio/2019/Community/VC"
export SMAKE_LLVM_WINDOWS_KITS_10_PATH="C:/Program Files (x86)/Windows Kits/10"

export SMAKE_LLVM_SYSROOT_AARCH64_LINUX_GNU=C:/sysroots/ubuntu14.04-aarch64-linux-gnu
export SMAKE_LLVM_SYSROOT_X86_64_LINUX_GNU=C:/sysroots/ubuntu14.04-x86_64-linux-gnu
export SMAKE_LLVM_SYSROOT_ARM_LINUX_GNUEABIHF=C:/sysroots/ubuntu14.04-arm-linux-gnueabihf
```
