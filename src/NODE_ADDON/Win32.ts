import { CACHE_DIR, downloadNodejs } from '../downloadNodejs';
import { LLVM_Win32 } from '../LLVM/Win32';

export abstract class NODE_ADDON_Win32 extends LLVM_Win32 {
  get NODE_VERSION() {
    return process.version;
  }
  get type() {
    return 'shared' as any;
  }
  get name() {
    return 'Win32 Node Addon Builder';
  }
  get cxflags() {
    const flags = [...super.cxflags, '-Daddon_EXPORTS', '-DNDEBUG'];
    return flags;
  }

  get sharedOutPrefix() {
    return '';
  }
  get sharedOutSuffix() {
    return '.node';
  }
  get shflags() {
    // 'C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Tools\MSVC\14.26.28801\bin\HostX64\x64\link.exe /ERR
    // ORREPORT:QUEUE /OUT:"C:\Users\yuche\Projects\napiTest\build\Debug\addon.node" /INCREMENTAL /NOLOGO "C:\Users\yuche\.c
    // make-js\node-x64\v12.16.0\win-x64\node.lib" kernel32.lib user32.lib gdi32.lib winspool.lib shell32.lib ole32.lib olea
    // ut32.lib uuid.lib comdlg32.lib advapi32.lib Delayimp.lib /DELAYLOAD:NODE.EXE /MANIFEST /MANIFESTUAC:"level='asInvoker
    // ' uiAccess='false'" /manifest:embed /DEBUG /PDB:"C:/Users/yuche/Projects/napiTest/build/Debug/addon.pdb" /SUBSYSTEM:C
    // ONSOLE /TLBID:1 /DYNAMICBASE /NXCOMPAT /IMPLIB:"C:/Users/yuche/Projects/napiTest/build/Debug/addon.lib" /MACHINE:X64
    // /DLL addon.dir\Debug\Greeter.obj
    // addon.dir\Debug\addon.obj
    // addon.dir\Debug\win_delay_load_hook.obj'
    const flags = [...super.shflags];
    return flags;
  }

  get includedirs() {
    return super.includedirs.concat([
      `${CACHE_DIR}/${this.NODE_VERSION}/include/node`,
    ]);
  }

  async generateCommands() {
    await downloadNodejs(this.NODE_VERSION);
    return super.generateCommands();
  }
}
