export type SystemPathMap = {
  home: string;
  desktop: string;
  downloads: string;
  documents: string;
  workspace: string;
  appData?: string;
};

export type PathShortcutItem = {
  id: string;
  label: string;
  description: string;
  key: keyof SystemPathMap;
};

export const PATH_SHORTCUTS: readonly PathShortcutItem[] = [
  {id: '%WORKSPACE%', label: 'Workspace', description: 'LynxHub workspace / project root', key: 'workspace'},
  {id: '%HOME%', label: 'Home', description: 'User home directory', key: 'home'},
  {id: '%DESKTOP%', label: 'Desktop', description: 'User desktop folder', key: 'desktop'},
  {id: '%DOWNLOADS%', label: 'Downloads', description: 'User downloads folder', key: 'downloads'},
  {id: '%DOCUMENTS%', label: 'Documents', description: 'User documents folder', key: 'documents'},
] as const;

/**
 * Resolves path shortcuts (%WORKSPACE%, %HOME%, %DESKTOP%, %DOWNLOADS%, %DOCUMENTS%, %APPDATA%, ~)
 * in a path string to their actual OS directory paths.
 */
export function resolvePathShortcuts(pathStr: string, systemPaths?: Partial<SystemPathMap>): string {
  if (!pathStr || !pathStr.trim()) return '';
  if (!systemPaths) return pathStr.trim();

  let resolved = pathStr.trim();

  if (systemPaths.workspace) {
    resolved = resolved.replace(/%WORKSPACE%/gi, systemPaths.workspace);
    resolved = resolved.replace(/%PROJECT%/gi, systemPaths.workspace);
  }

  if (systemPaths.home) {
    resolved = resolved.replace(/%HOME%/gi, systemPaths.home);
    resolved = resolved.replace(/^~(?=[\\/]|$)/, systemPaths.home);
  }

  if (systemPaths.desktop) {
    resolved = resolved.replace(/%DESKTOP%/gi, systemPaths.desktop);
  }

  if (systemPaths.downloads) {
    resolved = resolved.replace(/%DOWNLOADS%/gi, systemPaths.downloads);
  }

  if (systemPaths.documents) {
    resolved = resolved.replace(/%DOCUMENTS%/gi, systemPaths.documents);
  }

  if (systemPaths.appData) {
    resolved = resolved.replace(/%APPDATA%/gi, systemPaths.appData);
  }

  return resolved;
}
