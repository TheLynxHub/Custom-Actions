import StorageManager from '@lynx_main/storageSqlite/storageOperations';
import {dialog} from 'electron';
import * as fs from 'fs/promises';

import {storageKeys} from '../../common/consts/channels';
import {CustomCard} from '../../common/types/card';
import {sanitizeCards} from '../../common/utils/cardSanitizer';

export function getCards(storageManager: StorageManager): CustomCard[] {
  const data = storageManager.getCustomData(storageKeys.customActions);
  return sanitizeCards(data);
}

export function setCards(storageManager: StorageManager, cards: CustomCard[]): void {
  storageManager.setCustomData(storageKeys.customActions, cards);
}

export async function exportToFile(cards: CustomCard[]): Promise<boolean> {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: 'Export Custom Actions',
    defaultPath: 'custom_actions.json',
    filters: [{name: 'JSON/Text Files', extensions: ['json', 'txt']}],
  });

  if (canceled || !filePath) {
    return false;
  }

  await fs.writeFile(filePath, JSON.stringify(cards, null, 2), 'utf-8');
  return true;
}

export async function importFromFile(): Promise<CustomCard[] | null> {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    title: 'Import Custom Actions',
    properties: ['openFile'],
    filters: [{name: 'JSON/Text Files', extensions: ['json', 'txt']}],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const content = await fs.readFile(filePaths[0], 'utf-8');
  try {
    const parsed = JSON.parse(content);
    const sanitized = sanitizeCards(parsed);
    if (sanitized.length === 0) {
      throw new Error('No valid custom action cards found in file.');
    }
    return sanitized;
  } catch (e: any) {
    console.error('Failed to parse custom actions file:', e);
    throw new Error(e.message || 'Invalid file format. Expected a JSON array of custom cards.', {cause: e});
  }
}
