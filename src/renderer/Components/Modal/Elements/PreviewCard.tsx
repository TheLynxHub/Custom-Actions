import {Checkbox} from '@heroui/react';
import {PinIcon, StarIcon} from '@solar-icons/react/bold';
import {Folder2Icon, PenIcon, ShieldWarningIcon} from '@solar-icons/react/bold-duotone';
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
              'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ' +
              'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
            }>
            Both
          </span>
        );
      case 'terminal':
        return (
          <span
            className={
              'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ' +
              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }>
            CLI
          </span>
        );
      case 'browser':
        return (
          <span
            className={
              'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ' +
              'bg-accent/15 text-accent border border-accent/20'
            }>
            Web
          </span>
        );
      case 'executable':
        return (
          <span
            className={
              'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ' +
              'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
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

  return (
    <div
      className={
        'group relative flex flex-col justify-between p-3.5 rounded-3xl border ' +
        'transition-all duration-200 cursor-pointer min-h-40 ' +
        (isSelected
          ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
          : 'border-border/70 bg-surface/75 hover:bg-surface/90 hover:border-accent/30 hover:shadow-md')
      }
      onClick={() => handleEdit(card)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-x-2.5 min-w-0">
          <div
            className={
              'flex size-9 shrink-0 items-center justify-center rounded-full ' +
              (isRunning
                ? 'bg-emerald-500/15 ring-2 ring-emerald-500 dark:ring-emerald-400 animate-pulse '
                : 'bg-surface-tertiary/80 ring-1 ring-border/50 group-hover:ring-accent/40 group-hover:bg-accent/15 ') +
              'p-1.5 transition-all'
            }>
            <div className="size-5.5">{icon}</div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
              {title || 'Untitled Action'}
            </span>
            <span className="text-[10px] font-mono text-muted truncate">{getSummary()}</span>
          </div>
        </div>

        <div onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 shrink-0">
          {getTypeBadge()}
          {onSelect && (
            <div className="size-5 flex items-center justify-center">
              <Checkbox
                variant="secondary"
                onChange={onSelect}
                isSelected={isSelected}
                aria-label={`Select ${title}`}
                className={isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}>
                <Checkbox.Content>
                  <Checkbox.Control className="rounded-full size-4.5">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Content>
              </Checkbox>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted line-clamp-2 leading-relaxed my-2">
        {description || 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px] text-muted">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {isRunning && (
            <span
              className={
                'flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 ' +
                'text-emerald-600 dark:text-emerald-400 font-semibold text-[9px] border border-emerald-500/20'
              }>
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Running
            </span>
          )}

          {categories?.pinned && (
            <span
              className={
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold'
              }>
              <PinIcon className="size-2.5" />
              Pinned
            </span>
          )}
          {categories?.recentlyUsed && (
            <span
              className={'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold'}>
              <StarIcon className="size-2.5" />
              Recent
            </span>
          )}
          {cwd && (
            <span
              className={
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-secondary ' +
                'text-muted font-mono text-[9px] border border-border/40 truncate max-w-24'
              }
              title={`Working Directory: ${cwd}`}>
              <Folder2Icon className="size-2.5 shrink-0 text-accent" />
              <span className="truncate">{cwd}</span>
            </span>
          )}
          {variables.length > 0 && (
            <span
              className={
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent/10 ' +
                'text-accent font-semibold font-mono text-[9px] border border-accent/20'
              }
              title={`${variables.length} template variable(s): ${variables.map(v => v.name).join(', ')}`}>
              &#123;&#123;&#125;&#125; {variables.length} var{variables.length !== 1 ? 's' : ''}
            </span>
          )}
          {card.requireConfirmation && (
            <span
              className={
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-warning/10 ' +
                'text-warning font-semibold text-[9px] border border-warning/20'
              }
              title={
                card.confirmationMessage
                  ? `Safety Confirmation: ${card.confirmationMessage}`
                  : 'Requires safety confirmation before execution'
              }>
              <ShieldWarningIcon className="size-2.5" />
              Protected
            </span>
          )}
        </div>

        <div
          className={
            'flex items-center gap-1 shrink-0 opacity-0 ' + 'group-hover:opacity-100 transition-opacity text-foreground'
          }>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-accent">
            <PenIcon className="size-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
