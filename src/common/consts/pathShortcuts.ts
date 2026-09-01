import {PathShortcutItem} from '../types/pathShortcuts';

export const PATH_SHORTCUTS: readonly PathShortcutItem[] = [
  {id: '%WORKSPACE%', label: 'Workspace', description: 'LynxHub workspace / project root', key: 'workspace'},
  {id: '%HOME%', label: 'Home', description: 'User home directory', key: 'home'},
  {id: '%DESKTOP%', label: 'Desktop', description: 'User desktop folder', key: 'desktop'},
  {id: '%DOWNLOADS%', label: 'Downloads', description: 'User downloads folder', key: 'downloads'},
  {id: '%DOCUMENTS%', label: 'Documents', description: 'User documents folder', key: 'documents'},
] as const;
