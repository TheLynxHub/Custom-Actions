import {Radio, RadioGroup} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import {CustomCardType} from '@lynx_extension/common/types';
import {reducerActions, selectEditingCard} from '@lynx_extension/renderer/store';
import {PlayIcon} from '@solar-icons/react/bold';
import {EarthIcon} from '@solar-icons/react/bold-duotone';
import {ReactNode, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

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

export function CardTypeSection() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);

  const cardType = useMemo(() => editingCard?.cardType || 'terminal_browser', [editingCard]);

  const handleSelectType = (value: string) => {
    dispatch(reducerActions.setCardType(value as CustomCardType));
  };

  return (
    <RadioGroup
      className={
        'grid grid-cols-2 gap-2.5 w-full ' +
        '[&_[data-slot=radio]]:!mt-0 [&_[data-slot=radio]]:!m-0 [&_[data-slot=radio]]:w-full'
      }
      value={cardType}
      onChange={handleSelectType}
      aria-label="Select Card Type">
      {TYPE_OPTIONS.map(option => (
        <Radio key={option.id} value={option.id} aria-label={option.title} className="!mt-0 !m-0 w-full">
          {({isSelected}) => (
            <Radio.Content
              className={
                'group relative flex flex-col !items-start text-left p-3 rounded-2xl border !gap-0 ' +
                'transition-all duration-200 cursor-pointer w-full ' +
                (isSelected
                  ? 'border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30'
                  : 'border-border/60 bg-surface/50 hover:bg-surface-hover/80 hover:border-border')
              }>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-x-2.5 min-w-0">
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isSelected ? 'bg-accent/20' : 'bg-surface-tertiary/70'
                    }`}>
                    {option.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{option.title}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted">{option.tag}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                </div>
              </div>
              <p className="w-full text-left text-[11px] text-muted leading-tight mt-1.5">{option.description}</p>
            </Radio.Content>
          )}
        </Radio>
      ))}
    </RadioGroup>
  );
}

export default CardTypeSection;
