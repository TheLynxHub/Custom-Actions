import {Button, Form, Input, Label, Modal, ScrollShadow, TextField} from '@heroui/react';
import TabModal from '@lynx/components/TabModal';
import {
  CheckCircleIcon,
  CopyIcon,
  PlayCircleIcon,
  RestartIcon,
  ShieldWarningIcon,
} from '@solar-icons/react/bold-duotone';
import {FormEvent, ReactNode, useEffect, useMemo, useState} from 'react';

import {CustomCard} from '../../../cross/CrossTypes';
import {extractCardVariables, substituteCardVariables, TemplateVariable} from '../../../cross/templateVariables';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CustomCard;
  cardIcon?: ReactNode;
  onExecute: (resolvedCard: CustomCard) => void;
};

export function VariablePromptModal({isOpen, onOpenChange, card, cardIcon, onExecute}: Props) {
  const variables: TemplateVariable[] = useMemo(() => {
    return extractCardVariables(card);
  }, [card]);

  // Initial values mapped from default values
  const defaultValuesMap = useMemo(() => {
    const map: Record<string, string> = {};
    variables.forEach(v => {
      map[v.name] = v.defaultValue ?? '';
    });
    return map;
  }, [variables]);

  const [values, setValues] = useState<Record<string, string>>(defaultValuesMap);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(defaultValuesMap);
      setCopied(false);
    }
  }, [isOpen, defaultValuesMap]);

  const handleInputChange = (name: string, val: string) => {
    setValues(prev => ({...prev, [name]: val}));
  };

  const handleResetDefaults = () => {
    setValues(defaultValuesMap);
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const resolvedCard = substituteCardVariables(card, values);
    onExecute(resolvedCard);
    onOpenChange(false);
  };

  const resolvedCard = useMemo(() => {
    return substituteCardVariables(card, values);
  }, [card, values]);

  const activeActions = useMemo(() => {
    return (resolvedCard.actions || []).filter(a => !a.disabled);
  }, [resolvedCard]);

  const resolvedUrl = useMemo(() => {
    if (
      (resolvedCard.urlConfig?.type === 'custom' || resolvedCard.urlConfig?.type === 'htmlFile') &&
      resolvedCard.urlConfig?.customUrl
    ) {
      return resolvedCard.urlConfig.customUrl;
    }
    return null;
  }, [resolvedCard]);

  const handleCopyPreview = async () => {
    const lines = [...activeActions.map(a => a.action), ...(resolvedUrl ? [resolvedUrl] : [])];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const firstEmptyVarName = useMemo(() => {
    const emptyVar = variables.find(v => !v.defaultValue);
    return emptyVar ? emptyVar.name : variables[0]?.name;
  }, [variables]);

  return (
    <TabModal isOpen={isOpen} isDismissable={true} dialogClassName="max-w-xl" onOpenChange={onOpenChange}>
      <Modal.CloseTrigger />

      {/* Header with Pinned Live Command Preview */}
      <Modal.Header className="flex flex-col gap-y-3 px-6 pb-3">
        <div className="flex items-center justify-between gap-x-3 w-full">
          <div className="flex items-center gap-x-3 min-w-0">
            <div
              className={
                'flex size-10 shrink-0 items-center justify-center rounded-2xl ' +
                'bg-accent/15 text-accent p-2 ring-1 ring-accent/30'
              }>
              {cardIcon || <PlayCircleIcon className="size-6" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <Modal.Heading className="text-sm font-bold text-foreground truncate">
                  Run &quot;{card.title || 'Untitled Action'}&quot;
                </Modal.Heading>
                {card.requireConfirmation && (
                  <span
                    className={
                      'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ' +
                      'bg-warning/15 text-warning border border-warning/30 shrink-0'
                    }
                    title={card.confirmationMessage || 'Safety confirmation required'}>
                    <ShieldWarningIcon className="size-2.5" />
                    Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-tight mt-0.5">
                Configure {variables.length} template variable{variables.length !== 1 ? 's' : ''} before running.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onPress={handleCopyPreview}
            className="h-7 px-2 text-[10.5px] text-muted hover:text-foreground shrink-0">
            {copied ? <CheckCircleIcon className="size-3 text-success" /> : <CopyIcon className="size-3" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* Pinned Command Preview Box in Header */}
        <div
          className={
            'flex flex-col gap-1 overflow-y-auto rounded-2xl w-full ' +
            'bg-surface-secondary px-3 py-2 border border-border font-JetBrainsMono text-xs select-all'
          }>
          {' '}
          {activeActions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-2 text-foreground/90 leading-tight">
              {activeActions.length > 1 && (
                <span className="text-muted/60 text-[10px] select-none shrink-0 font-sans">{idx + 1}.</span>
              )}
              <span className="break-all whitespace-pre-wrap flex-1">{action.action}</span>
            </div>
          ))}
          {resolvedUrl && (
            <div
              className={
                'flex items-start gap-2 text-cyan-600 dark:text-cyan-400 leading-tight ' +
                (activeActions.length > 0 ? 'pt-1 border-t border-border/30' : '')
              }>
              <span className="text-muted/60 text-[10px] select-none shrink-0 font-sans">URL:</span>
              <span className="break-all whitespace-pre-wrap flex-1">{resolvedUrl}</span>
            </div>
          )}
          {activeActions.length === 0 && !resolvedUrl && (
            <span className="text-muted text-xs italic">No active commands or URLs configured.</span>
          )}
        </div>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="overflow-hidden">
        <Form className="h-full" onSubmit={handleSubmit} id="variable-prompt-form">
          <ScrollShadow className="pr-1 space-y-4 h-full">
            {variables.map((v, i) => {
              const currentValue = values[v.name] ?? '';
              const isDefault = v.defaultValue !== undefined && currentValue === v.defaultValue;

              return (
                <div
                  key={v.name}
                  className="flex flex-col gap-y-1.5 p-3 rounded-2xl bg-surface-secondary/60 border border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <span className="font-JetBrainsMono text-accent font-bold">&#123;&#123;{v.name}&#125;&#125;</span>
                    </Label>

                    {v.defaultValue !== undefined && (
                      <span
                        className={
                          'text-[10px] px-2 py-0.5 rounded-full ' +
                          (isDefault
                            ? 'bg-surface text-accent font-medium'
                            : 'bg-surface-tertiary text-muted border border-border/50')
                        }>
                        default: {v.defaultValue || '""'}
                      </span>
                    )}
                  </div>

                  <TextField
                    name={v.name}
                    autoFocus={i === 0}
                    value={currentValue}
                    onChange={val => handleInputChange(v.name, val)}
                    fullWidth>
                    <Input
                      autoFocus={v.name === firstEmptyVarName}
                      className="font-JetBrainsMono text-xs bg-surface shadow-surface"
                      placeholder={v.defaultValue ? `Default: ${v.defaultValue}` : `Enter value for ${v.name}...`}
                    />
                  </TextField>

                  {/* Snippet Usages */}
                  {v.usages.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1">
                      {v.usages.slice(0, 2).map((usage, uIdx) => (
                        <div
                          key={uIdx}
                          className="flex items-center gap-1.5 text-[10.5px] text-muted/80 font-JetBrainsMono truncate">
                          <span
                            className={
                              'text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface text-muted shrink-0'
                            }>
                            {usage.type}
                          </span>
                          <span className="truncate">{usage.snippet}</span>
                        </div>
                      ))}
                      {v.usages.length > 2 && (
                        <span className="text-[10px] text-muted/60 pl-1 font-mono">
                          +{v.usages.length - 2} more references
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollShadow>
        </Form>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer>
        <div className="flex items-center gap-2">
          {variables.some(v => v.defaultValue !== undefined) && (
            <Button
              size="sm"
              variant="ghost"
              onPress={handleResetDefaults}
              className="text-muted hover:text-foreground">
              <RestartIcon className="size-3.5" />
              Reset Defaults
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="md" variant="secondary" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="md" type="submit" form="variable-prompt-form" onPress={() => handleSubmit()}>
            <PlayCircleIcon className="size-4" />
            Run Action
          </Button>
        </div>
      </Modal.Footer>
    </TabModal>
  );
}
