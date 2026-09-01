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
