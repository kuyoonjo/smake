const { run, LLVM_Win32 } = require('../lib');

const prefix = '/opt/homebrew/opt/llvm/bin/';
const ARCH = 'x86_64';
const MSVC_PATH = '/Users/yu/Toolchains/MSVC/VC';
const MSVC_VERSION = '1928';
const WINDOWS_KITS_10_PATH = '/Users/yu/Toolchains/MSVC/Kits/10';
const WINDOWS_KITS_10_VERSION = '10.0.19041.0';

class win32_executable extends LLVM_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  files = ['src/main.c'];
}

class win32_static extends LLVM_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  type = 'static';
  files = ['src/lib.cpp'];
}
class win32_static_executable extends LLVM_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  files = ['src/libmain.cpp'];
  libs = [win32_static];
}

class win32_shared extends LLVM_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  type = 'shared';
  files = ['src/dll.cpp'];
}
class win32_shared_executable extends LLVM_Win32 {
  prefix = prefix;
  ARCH = ARCH;
  MSVC_PATH = MSVC_PATH;
  MSVC_VERSION = MSVC_VERSION;
  WINDOWS_KITS_10_PATH = WINDOWS_KITS_10_PATH;
  WINDOWS_KITS_10_VERSION = WINDOWS_KITS_10_VERSION;
  files = ['src/dllmain.cpp'];
  libs = [win32_shared];
}

run([
  win32_executable,
  win32_static,
  win32_static_executable,
  win32_shared,
  win32_shared_executable,
], process.argv.slice(2));