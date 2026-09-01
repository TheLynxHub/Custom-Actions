export type CustomCategories = {
  pinned?: boolean;
  recentlyUsed?: boolean;
  all?: boolean;
  image?: boolean;
  text?: boolean;
  audio?: boolean;
};

export type CustomCategory = keyof CustomCategories;

export type CustomCardType = 'executable' | 'browser' | 'terminal' | 'terminal_browser';

export type CustomUrlConfigType = 'custom' | 'findLine' | 'nothing' | 'htmlFile';

export type CustomUrlConfig = {
  type: CustomUrlConfigType;
  customUrl?: string;
  openImmediately?: boolean;
  timeout?: number;
  findLine?: string;
};

export type CustomExecuteActions = {
  id?: string;
  action: string;
  type: 'script' | 'exe' | 'open' | 'command';
  cwd?: string;
  disabled?: boolean;
};

export type CustomEnvVar = {key: string; value: string};

export type CustomCard = {
  id: string;
  cardType: CustomCardType;
  urlConfig: CustomUrlConfig;
  title: string;
  description?: string;
  icon?: string;
  cwd?: string;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  categories: CustomCategories;
  actions: CustomExecuteActions[];
  env?: CustomEnvVar[];
};

export type RunningExecution = {
  cardId: string;
  tabId: string;
  ptyId: string;
  cardType: CustomCardType;
  startedAt: number;
};
