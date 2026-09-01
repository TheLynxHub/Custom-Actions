import {SystemPathMap} from '../types/pathShortcuts';

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
