import {Checkbox, Tooltip} from '@heroui/react';
import {PinIcon, StarIcon} from '@solar-icons/react/bold';
import {Code2Icon, Folder2Icon, PenIcon, ShieldWarningIcon} from '@solar-icons/react/bold-duotone';
import {ReactNode, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {CustomCard} from '../../../../cross/CrossTypes';
import {extractCardVariables} from '../../../../cross/templateVariables';
import {selectRunningExecutions} from '../../../reducer';

type Props = {
  card: CustomCard;
  handleEdit: (card: CustomCard) => void;
  icon: ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function PreviewCard({card, handleEdit, icon, isSelected, onSelect}: Props) {
  const {title, description, cardType, actions, categories, urlConfig, cwd} = card;

  const runningExecutions = useSelector(selectRunningExecutions);
  const isRunning = useMemo(
    () => runningExecutions.some(item => item.cardId === card.id),
    [runningExecutions, card.id],
  );

  const variables = useMemo(() => extractCardVariables(card), [card]);

  const getTypeBadge = () => {
    switch (cardType) {
      case 'terminal_browser':
        return (
          <span
            className={
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ' +
              'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15'
            }>
            Both
          </span>
        );
      case 'terminal':
        return (
          <span
            className={
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ' +
              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15'
            }>
            CLI
          </span>
        );
      case 'browser':
        return (
          <span
            className={
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ' +
              'bg-accent/15 text-accent border border-accent/15'
            }>
            Web
          </span>
        );
      case 'executable':
        return (
          <span
            className={
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ' +
              'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/15'
            }>
            EXE
          </span>
        );
    }
  };

  const getSummary = () => {
    if (actions.length > 0) {
      return `${actions.length} step${actions.length !== 1 ? 's' : ''}`;
    }
    if (urlConfig.customUrl) {
      return urlConfig.customUrl.replace(/^https?:\/\//, '');
    }
    return '1 action';
  };

  const getShortCwd = (pathStr: string) => {
    const clean = pathStr.replace(/[\\/]+$/, '');
    const parts = clean.split(/[\\/]/).filter(Boolean);
    if (parts.length === 0) return pathStr;
    return parts[parts.length - 1];
  };

  const renderRunningIndicator = () => (
    <Tooltip delay={150}>
      <Tooltip.Trigger>
        <span
          className={
            'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 ' +
            'text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border ' +
            'border-emerald-500/25 shrink-0'
          }>
          Running
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p className="text-xs font-semibold text-emerald-500">Active Process</p>
        <p className="text-[10px] text-muted">Currently running in background</p>
      </Tooltip.Content>
    </Tooltip>
  );

  return (
    <div
      className={
        'group relative flex flex-col justify-between p-4 rounded-3xl border ' +
        'transition-all duration-200 cursor-pointer min-h-42 select-none ' +
        (isSelected
          ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
          : 'border-border/60 bg-surface-secondary/40 hover:bg-surface-secondary/70 hover:border-accent/40 ' +
            'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]')
      }
      onClick={() => handleEdit(card)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-x-2.5 min-w-0">
          <div
            className={
              'flex size-9.5 shrink-0 items-center justify-center rounded-full ' +
              (isRunning
                ? 'bg-emerald-500/15 ring-2 ring-emerald-500/80 animate-pulse '
                : 'bg-surface-tertiary/90 ring-1 ring-border/60 group-hover:ring-accent/40 group-hover:bg-accent/15 ') +
              'p-2 transition-all duration-200'
            }>
            <div className="size-5 flex items-center justify-center">{icon}</div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
              {title || 'Untitled Action'}
            </span>
            <span className="text-[10px] font-mono text-muted truncate">{getSummary()}</span>
          </div>
        </div>

        <div onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 shrink-0">
          {isRunning ? renderRunningIndicator() : getTypeBadge()}
          {onSelect && (
            <div className="size-5 flex items-center justify-center">
              <Checkbox
                variant="secondary"
                onChange={onSelect}
                isSelected={isSelected}
                aria-label={`Select ${title}`}
                className={isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}>
                <Checkbox.Content>
                  <Checkbox.Control className={'rounded-full before:rounded-full size-4'}>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Content>
              </Checkbox>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 my-2.5 min-h-7 flex items-start">
        <p className="text-xs text-muted/80 line-clamp-2 leading-relaxed">
          {description || 'No description provided.'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/40">
        {/* Left: Working directory / Context */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {cwd ? (
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <div
                  className={
                    'flex items-center gap-1 text-[11px] font-mono text-muted ' +
                    'hover:text-foreground transition-colors truncate max-w-32'
                  }>
                  <Folder2Icon className="size-3.5 shrink-0 text-accent/80" />
                  <span className="truncate">{getShortCwd(cwd)}</span>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs font-semibold text-foreground">Working Directory</p>
                <p className="text-[10px] font-mono text-muted max-w-xs break-all">{cwd}</p>
              </Tooltip.Content>
            </Tooltip>
          ) : (
            <span className="text-[10px] font-mono text-muted/60">Ready</span>
          )}
        </div>

        {/* Right: Status Indicators Cluster & Edit Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {categories?.pinned && (
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <div
                  className={
                    'flex size-5.5 items-center justify-center rounded-full ' +
                    'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                  }>
                  <PinIcon className="size-3" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs">Pinned to Top</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {categories?.recentlyUsed && (
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <div
                  className={
                    'flex size-5.5 items-center justify-center rounded-full ' +
                    'bg-accent/10 text-accent border border-accent/15'
                  }>
                  <StarIcon className="size-3" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs">Recently Used</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {variables.length > 0 && (
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <div
                  className={
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 ' +
                    'text-accent text-[10px] font-mono font-medium border border-accent/15'
                  }>
                  <Code2Icon className="size-3 shrink-0" />
                  <span>{variables.length}</span>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs font-semibold text-accent">
                  {variables.length} Template {variables.length === 1 ? 'Variable' : 'Variables'}
                </p>
                <p className="text-[10px] font-mono text-muted">{variables.map(v => v.name).join(', ')}</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {card.requireConfirmation && (
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <div
                  className={
                    'flex size-5.5 items-center justify-center rounded-full ' +
                    'bg-warning/10 text-warning border border-warning/15'
                  }>
                  <ShieldWarningIcon className="size-3" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs font-semibold text-warning">Safety Confirmation</p>
                <p className="text-[10px] text-muted max-w-xs">
                  {card.confirmationMessage || 'Requires user confirmation before execution'}
                </p>
              </Tooltip.Content>
            </Tooltip>
          )}

          <div
            className={
              'size-5.5 min-w-0 p-0 rounded-full text-muted flex items-center justify-center ' +
              'opacity-0 group-hover:opacity-100 transition-all duration-150'
            }
            aria-label="Edit action">
            <PenIcon className="size-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
