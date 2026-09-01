import {
  CustomCard,
  CustomCardType,
  CustomCategories,
  CustomCategory,
  CustomEnvVar,
  CustomExecuteActions,
  CustomUrlConfig,
  CustomUrlConfigType,
} from '../types/card';

const VALID_CARD_TYPES: readonly CustomCardType[] = ['executable', 'browser', 'terminal', 'terminal_browser'];
const VALID_URL_CONFIG_TYPES: readonly CustomUrlConfigType[] = ['custom', 'findLine', 'nothing', 'htmlFile'];
const VALID_ACTION_TYPES: readonly CustomExecuteActions['type'][] = ['script', 'exe', 'open', 'command'];
const VALID_CATEGORIES: readonly CustomCategory[] = ['pinned', 'recentlyUsed', 'all', 'image', 'text', 'audio'];

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function sanitizeUrlConfig(raw: unknown): CustomUrlConfig {
  const defaultConfig: CustomUrlConfig = {
    type: 'nothing',
    openImmediately: true,
    timeout: 5,
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultConfig;
  }

  const obj = raw as Record<string, unknown>;
  const type = VALID_URL_CONFIG_TYPES.includes(obj.type as CustomUrlConfigType)
    ? (obj.type as CustomUrlConfigType)
    : 'nothing';

  const config: CustomUrlConfig = {
    type,
    openImmediately: typeof obj.openImmediately === 'boolean' ? obj.openImmediately : true,
    timeout: typeof obj.timeout === 'number' && Number.isFinite(obj.timeout) && obj.timeout >= 0 ? obj.timeout : 5,
  };

  if (typeof obj.customUrl === 'string' && obj.customUrl.trim()) {
    config.customUrl = obj.customUrl.trim();
  }

  if (typeof obj.findLine === 'string' && obj.findLine.trim()) {
    config.findLine = obj.findLine.trim();
  }

  return config;
}

export function sanitizeCategories(raw: unknown): CustomCategories {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const obj = raw as Record<string, unknown>;
  const categories: CustomCategories = {};

  for (const key of VALID_CATEGORIES) {
    if (typeof obj[key] === 'boolean') {
      categories[key] = obj[key] as boolean;
    }
  }

  return categories;
}

export function sanitizeActions(raw: unknown): CustomExecuteActions[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const actions: CustomExecuteActions[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }

    const obj = item as Record<string, unknown>;
    const action = typeof obj.action === 'string' ? obj.action : String(obj.action ?? '');
    const type = VALID_ACTION_TYPES.includes(obj.type as CustomExecuteActions['type'])
      ? (obj.type as CustomExecuteActions['type'])
      : 'command';
    const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : generateUUID();
    const disabled = typeof obj.disabled === 'boolean' ? obj.disabled : undefined;
    const cwd = typeof obj.cwd === 'string' && obj.cwd.trim() ? obj.cwd.trim() : undefined;

    actions.push({
      id,
      action,
      type,
      ...(cwd ? {cwd} : {}),
      ...(disabled !== undefined ? {disabled} : {}),
    });
  }

  return actions;
}

export function sanitizeEnv(raw: unknown): CustomEnvVar[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const env: CustomEnvVar[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }

    const obj = item as Record<string, unknown>;
    const key = typeof obj.key === 'string' ? obj.key : String(obj.key ?? '');
    const value = typeof obj.value === 'string' ? obj.value : String(obj.value ?? '');

    if (key.trim() || value.trim()) {
      env.push({key, value});
    }
  }

  return env;
}

export function sanitizeCard(raw: unknown): CustomCard | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : generateUUID();
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : 'Untitled Action';
  const description = typeof obj.description === 'string' ? obj.description : undefined;
  const icon = typeof obj.icon === 'string' && obj.icon.trim() ? obj.icon.trim() : 'bot';
  const cwd = typeof obj.cwd === 'string' && obj.cwd.trim() ? obj.cwd.trim() : undefined;
  const requireConfirmation = typeof obj.requireConfirmation === 'boolean' ? obj.requireConfirmation : undefined;
  const confirmationMessage =
    typeof obj.confirmationMessage === 'string' && obj.confirmationMessage.trim()
      ? obj.confirmationMessage.trim()
      : undefined;
  const cardType = VALID_CARD_TYPES.includes(obj.cardType as CustomCardType)
    ? (obj.cardType as CustomCardType)
    : 'terminal_browser';

  const urlConfig = sanitizeUrlConfig(obj.urlConfig);
  const categories = sanitizeCategories(obj.categories);
  const actions = sanitizeActions(obj.actions);
  const env = sanitizeEnv(obj.env);

  return {
    id,
    title,
    description,
    icon,
    cwd,
    requireConfirmation,
    confirmationMessage,
    cardType,
    urlConfig,
    categories,
    actions,
    env,
  };
}

export function sanitizeCards(raw: unknown): CustomCard[] {
  if (!raw) {
    return [];
  }

  const items = Array.isArray(raw) ? raw : [raw];
  const sanitized: CustomCard[] = [];

  for (const item of items) {
    const card = sanitizeCard(item);
    if (card) {
      sanitized.push(card);
    }
  }

  return sanitized;
}
