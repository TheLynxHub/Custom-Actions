import {Terminal_Icon} from '@lynx_assets/icons';
import {CheckCircleIcon, PlayIcon} from '@solar-icons/react/bold';
import {EarthIcon} from '@solar-icons/react/bold-duotone';
import {ReactNode, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomCardType} from '../../../../cross/CrossTypes';
import {reducerActions, selectEditingCard} from '../../../reducer';

type TypeOption = {
  id: CustomCardType;
  title: string;
  description: string;
  icon: ReactNode;
  tag: string;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    id: 'terminal_browser',
    title: 'Terminal & Browser',
    description: 'Runs terminal commands and opens a live web view simultaneously.',
    icon: (
      <div className="flex items-center text-accent">
        <Terminal_Icon className="size-5" />
        <EarthIcon className="size-5 text-cyan-400" />
      </div>
    ),
    tag: 'Full Stack',
  },
  {
    id: 'terminal',
    title: 'Terminal Only',
    description: 'Executes shell commands, run scripts, or starts interactive CLI processes.',
    icon: <Terminal_Icon className="size-5 text-emerald-400" />,
    tag: 'CLI & Scripts',
  },
  {
    id: 'browser',
    title: 'Browser Only',
    description: 'Opens a dedicated web page, local dev server, or HTML file directly.',
    icon: <EarthIcon className="size-5 text-cyan-400" />,
    tag: 'Web & UI',
  },
  {
    id: 'executable',
    title: 'Native Executable',
    description: 'Launches standalone binaries, games, or native local applications.',
    icon: <PlayIcon className="size-5 text-amber-400" />,
    tag: 'Binary / App',
  },
];

export function CardType() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);

  const cardType = useMemo(() => editingCard?.cardType || 'terminal_browser', [editingCard]);

  const handleSelectType = (id: CustomCardType) => {
    dispatch(reducerActions.setCardType(id));
  };

  return (
    <div role="radiogroup" aria-label="Select Card Type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TYPE_OPTIONS.map(option => {
        const isSelected = cardType === option.id;
        return (
          <button
            className={
              'group relative flex flex-col justify-between text-left p-3.5 rounded-3xl border ' +
              'transition-all duration-200 cursor-pointer ' +
              (isSelected
                ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
                : 'border-border/60 bg-surface/50 hover:bg-surface-hover/80 hover:border-border')
            }
            role="radio"
            type="button"
            key={option.id}
            aria-checked={isSelected}
            onClick={() => handleSelectType(option.id)}>
            <div className="flex items-start justify-between gap-2 mb-2 w-full">
              <div className="flex items-center gap-x-2.5">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors`}>
                  {option.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground group-hover:text-foreground">
                    {option.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">{option.tag}</span>
                </div>
              </div>
              <div className="shrink-0 pt-0.5">
                {isSelected ? (
                  <CheckCircleIcon className="size-4.5 text-accent animate-in fade-in zoom-in-75 duration-150" />
                ) : (
                  <div className="size-4 rounded-full border border-muted/50 group-hover:border-muted" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
