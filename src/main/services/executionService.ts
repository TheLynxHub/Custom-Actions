import {ptyChannels} from '@lynx_common/consts/ipcChannels/pty';
import type MainWindowManager from '@lynx_main/mainWindow';
import {ipcMain} from 'electron';

import {customActionsChannels} from '../../common/consts/channels';
import ProcessManager from './processManager';

const processMap = new Map<string, ProcessManager>();

export function registerExecutionHandlers(appManager: MainWindowManager): void {
  ipcMain.on(
    customActionsChannels.startExe,
    (_, id: string, exePath: string, env?: Record<string, string>, cwd?: string) => {
      // Stop existing process with same ID if any
      if (processMap.has(id)) {
        processMap.get(id)?.stop();
        processMap.delete(id);
      }
      const manager = new ProcessManager(
        id,
        exePath,
        appManager,
        exitId => {
          processMap.delete(exitId);
        },
        env,
        cwd,
      );
      processMap.set(id, manager);
    },
  );

  ipcMain.on(ptyChannels.stopProcess, (_, id: string) => {
    const manager = processMap.get(id);
    if (manager) {
      manager.stop();
      processMap.delete(id);
    }
  });
}
