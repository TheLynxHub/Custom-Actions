export type TemplateVariableUsage = {
  type: 'command' | 'script' | 'exe' | 'open' | 'url' | 'findLine' | 'env' | 'cwd';
  snippet: string;
};

export type TemplateVariable = {
  name: string;
  defaultValue?: string;
  usages: TemplateVariableUsage[];
};
