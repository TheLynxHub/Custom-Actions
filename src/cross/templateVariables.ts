import {CustomCard} from './CrossTypes';

export type TemplateVariableUsage = {
  type: 'command' | 'script' | 'exe' | 'open' | 'url' | 'findLine' | 'env' | 'cwd';
  snippet: string;
};

export type TemplateVariable = {
  name: string;
  defaultValue?: string;
  usages: TemplateVariableUsage[];
};

export const TEMPLATE_VARIABLE_REGEX = /\{\{([a-zA-Z0-9_.-]+)(?::([^}]*))?\}\}/g;

/**
 * Extracts raw template variables from a single string.
 */
export function extractTemplateVariables(text: string): {name: string; defaultValue?: string}[] {
  if (!text) return [];
  const results: {name: string; defaultValue?: string}[] = [];
  const regex = new RegExp(TEMPLATE_VARIABLE_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [, name, defaultValue] = match;
    if (name) {
      results.push({name, defaultValue});
    }
  }

  return results;
}

/**
 * Extracts all unique template variables from a CustomCard across its actions, working directory, URL config, and env vars.
 */
export function extractCardVariables(card: CustomCard): TemplateVariable[] {
  const variableMap = new Map<string, {defaultValue?: string; usages: TemplateVariableUsage[]}>();

  const addUsage = (name: string, defaultValue: string | undefined, usage: TemplateVariableUsage) => {
    const existing = variableMap.get(name);
    if (existing) {
      if (!existing.defaultValue && defaultValue) {
        existing.defaultValue = defaultValue;
      }
      existing.usages.push(usage);
    } else {
      variableMap.set(name, {
        defaultValue,
        usages: [usage],
      });
    }
  };

  // 1. Scan card working directory
  if (card.cwd) {
    const found = extractTemplateVariables(card.cwd);
    found.forEach(({name, defaultValue}) => {
      addUsage(name, defaultValue, {
        type: 'cwd',
        snippet: `Working Directory: ${card.cwd}`,
      });
    });
  }

  // 2. Scan actions & action-level cwds
  if (Array.isArray(card.actions)) {
    card.actions.forEach(action => {
      if (action.disabled) return;
      const found = extractTemplateVariables(action.action || '');
      found.forEach(({name, defaultValue}) => {
        addUsage(name, defaultValue, {
          type: action.type,
          snippet: action.action,
        });
      });
      if (action.cwd) {
        const foundCwd = extractTemplateVariables(action.cwd);
        foundCwd.forEach(({name, defaultValue}) => {
          addUsage(name, defaultValue, {
            type: 'cwd',
            snippet: action.cwd || '',
          });
        });
      }
    });
  }

  // 3. Scan URL Config
  if (card.urlConfig) {
    if (card.urlConfig.customUrl) {
      const found = extractTemplateVariables(card.urlConfig.customUrl);
      found.forEach(({name, defaultValue}) => {
        addUsage(name, defaultValue, {
          type: 'url',
          snippet: card.urlConfig.customUrl || '',
        });
      });
    }
    if (card.urlConfig.findLine) {
      const found = extractTemplateVariables(card.urlConfig.findLine);
      found.forEach(({name, defaultValue}) => {
        addUsage(name, defaultValue, {
          type: 'findLine',
          snippet: card.urlConfig.findLine || '',
        });
      });
    }
  }

  // 4. Scan Env Vars
  if (Array.isArray(card.env)) {
    card.env.forEach(envItem => {
      if (envItem.value) {
        const found = extractTemplateVariables(envItem.value);
        found.forEach(({name, defaultValue}) => {
          addUsage(name, defaultValue, {
            type: 'env',
            snippet: `${envItem.key}=${envItem.value}`,
          });
        });
      }
    });
  }

  return Array.from(variableMap.entries()).map(([name, data]) => ({
    name,
    defaultValue: data.defaultValue,
    usages: data.usages,
  }));
}

/**
 * Checks if a card contains any active template variables.
 */
export function hasTemplateVariables(card: CustomCard): boolean {
  return extractCardVariables(card).length > 0;
}

/**
 * Substitutes variables in a single string using user-provided values, falling back to defaults or empty strings.
 */
export function substituteVariables(text: string, values: Record<string, string>): string {
  if (!text) return text;
  return text.replace(new RegExp(TEMPLATE_VARIABLE_REGEX), (_match, name: string, defaultValue?: string) => {
    const val = values[name];
    if (val !== undefined && val !== '') {
      return val;
    }
    return defaultValue !== undefined ? defaultValue : '';
  });
}

/**
 * Returns a cloned CustomCard with all template variables substituted with resolved values.
 */
export function substituteCardVariables(card: CustomCard, values: Record<string, string>): CustomCard {
  return {
    ...card,
    cwd: card.cwd ? substituteVariables(card.cwd, values) : undefined,
    actions: card.actions.map(action => ({
      ...action,
      action: substituteVariables(action.action, values),
      cwd: action.cwd ? substituteVariables(action.cwd, values) : undefined,
    })),
    urlConfig: {
      ...card.urlConfig,
      customUrl: card.urlConfig.customUrl ? substituteVariables(card.urlConfig.customUrl, values) : undefined,
      findLine: card.urlConfig.findLine ? substituteVariables(card.urlConfig.findLine, values) : undefined,
    },
    env: card.env
      ? card.env.map(envVar => ({
          key: substituteVariables(envVar.key, values),
          value: substituteVariables(envVar.value, values),
        }))
      : undefined,
  };
}
