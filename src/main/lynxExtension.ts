import {ExtensionMainApi, MainExtensionUtils} from '@lynx_main/plugins/extensions/types';
import {app, ipcMain} from 'electron';

import {SENTRY_DSN} from '../cross/constants';
import {CustomCard} from '../cross/CrossTypes';
import {customActionsChannels} from '../cross/CrossUtils';
import {SystemPathMap} from '../cross/pathShortcuts';
import {exportToFile, getCards, importFromFile, setCards} from './Methods/CardsManager';
import startExecute from './Methods/StartExecute';

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  lynxApi.initNodeSentry(SENTRY_DSN);

  lynxApi.listenForChannels(() => {
    utils.getStorageManager().then(storageManager => {
      ipcMain.handle(customActionsChannels.getCards, () => getCards(storageManager));
      ipcMain.on(customActionsChannels.setCards, (_, cards: CustomCard[]) => setCards(storageManager, cards));
      ipcMain.handle(customActionsChannels.exportToFile, (_, cards: CustomCard[]) => exportToFile(cards));
      ipcMain.handle(customActionsChannels.importFromFile, () => importFromFile());
      ipcMain.handle(customActionsChannels.getSystemPaths, async (): Promise<SystemPathMap> => {
        const appDataDir = storageManager.getData('app').appDataDir || app.getPath('userData');
        return {
          home: app.getPath('home'),
          desktop: app.getPath('desktop'),
          downloads: app.getPath('downloads'),
          documents: app.getPath('documents'),
          workspace: appDataDir,
          appData: app.getPath('userData'),
        };
      });
    });
    utils.getAppManager().then(appManager => {
      startExecute(appManager);
    });
  });
}
