import {Button, InputGroup, Label, NumberField, TextField} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import {ClockCircleIcon} from '@solar-icons/react/bold';
import {EarthIcon, FileCheckIcon, FolderOpenIcon, MagnifierIcon} from '@solar-icons/react/bold-duotone';
import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomUrlConfigType} from '../../../../cross/CrossTypes';
import {extractTemplateVariables} from '../../../../cross/templateVariables';
import {reducerActions, selectEditingCard} from '../../../reducer';

type StrategyOption = {
  id: CustomUrlConfigType;
  title: string;
  desc: string;
  icon?: ReactNode;
};

const STRATEGIES: StrategyOption[] = [
  {
    id: 'nothing',
    title: 'No Browser',
    desc: 'Do not open web tab',
  },
  {
    id: 'custom',
    title: 'Custom URL',
    desc: 'Direct HTTP or localhost',
    icon: <EarthIcon className="size-4 text-cyan-400" />,
  },
  {
    id: 'htmlFile',
    title: 'Local HTML',
    desc: 'Local file in workspace',
    icon: <FileCheckIcon className="size-4 text-emerald-400" />,
  },
  {
    id: 'findLine',
    title: 'Scan Terminal',
    desc: 'Extract URL from logs',
    icon: <MagnifierIcon className="size-4 text-accent" />,
  },
];

export function UrlConfig() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);
  const [isSelectingFile, setIsSelectingFile] = useState(false);

  const urlConfigType = useMemo(() => editingCard?.urlConfig.type || 'nothing', [editingCard]);
  const customUrl = useMemo(() => editingCard?.urlConfig.customUrl, [editingCard]);
  const openImmediately = useMemo(() => editingCard?.urlConfig.openImmediately ?? true, [editingCard]);
  const timeout = useMemo(() => editingCard?.urlConfig.timeout || 5, [editingCard]);
  const findLine = useMemo(() => editingCard?.urlConfig.findLine || '', [editingCard]);

  const urlVars = useMemo(() => extractTemplateVariables(customUrl || ''), [customUrl]);
  const findLineVars = useMemo(() => extractTemplateVariables(findLine || ''), [findLine]);

  const setUrlConfigType = (value: CustomUrlConfigType) => dispatch(reducerActions.setUrlConfigType(value));
  const setCustomUrl = (value: string) => dispatch(reducerActions.setCustomUrl(value));
  const setOpenImmediately = (value: boolean) => dispatch(reducerActions.setOpenImmediately(value));
  const setTimeoutValue = (value: number) => dispatch(reducerActions.setTimeoutValue(value));
  const setFindLine = (value: string) => dispatch(reducerActions.setFindLine(value));

  const handleSelectHtmlFile = () => {
    setIsSelectingFile(true);
    filesIpc
      .openDlg({
        properties: ['openFile'],
        filters: [
          {name: 'HTML Files', extensions: ['html', 'htm']},
          {name: 'All Files', extensions: ['*']},
        ],
      })
      .then(action => {
        if (action) {
          setCustomUrl(action);
        }
        setIsSelectingFile(false);
      });
  };

  const renderTimingSelector = () => (
    <div
      className={
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 ' +
        'rounded-3xl bg-surface/70 shadow-surface'
      }>
      <div className="flex items-center gap-2">
        <ClockCircleIcon className="size-4 text-accent shrink-0" />
        <span className="text-xs font-semibold text-foreground">Open Browser Tab</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          className={
            openImmediately
              ? 'bg-accent/15 shadow-accent text-accent font-semibold'
              : 'bg-surface shadow-surface hover:bg-surface-secondary'
          }
          size="sm"
          onPress={() => setOpenImmediately(true)}
          variant={openImmediately ? 'secondary' : 'ghost'}>
          Immediately
        </Button>
        <Button
          className={
            !openImmediately
              ? 'bg-accent/15 shadow-accent text-accent font-semibold'
              : 'bg-surface shadow-surface hover:bg-surface-secondary'
          }
          size="sm"
          onPress={() => setOpenImmediately(false)}
          variant={!openImmediately ? 'secondary' : 'ghost'}>
          After Delay (Seconds)
        </Button>

        {!openImmediately && (
          <NumberField
            name="delay"
            minValue={0.1}
            maxValue={300}
            value={timeout}
            defaultValue={1}
            onChange={setTimeoutValue}
            className="w-full max-w-40">
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-y-3.5">
      {/* Strategy selector pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STRATEGIES.map(item => {
          const isSelected = urlConfigType === item.id;
          return (
            <button
              className={
                'flex flex-col items-center justify-center text-center p-2.5 rounded-3xl ' +
                'transition-all duration-200 cursor-pointer ' +
                (isSelected
                  ? 'border border-accent bg-accent/15 text-foreground ring-1 ring-accent/30 shadow-xs'
                  : 'shadow-surface bg-surface text-muted hover:text-foreground hover:bg-surface-hover ')
              }
              key={item.id}
              type="button"
              onClick={() => setUrlConfigType(item.id)}>
              <div className="flex items-center gap-1.5 mb-1">
                {item.icon}
                <span className="text-xs font-semibold text-foreground">{item.title}</span>
              </div>
              <span className="text-[10px] text-muted line-clamp-1">{item.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Strategy Forms */}
      <AnimatePresence mode="wait">
        {urlConfigType === 'custom' && (
          <motion.div
            key="custom"
            exit={{opacity: 0, y: -6}}
            animate={{opacity: 1, y: 0}}
            initial={{opacity: 0, y: -6}}
            transition={{duration: 0.15}}
            className="flex flex-col gap-y-3 pt-1 border-t border-border/30">
            <TextField value={customUrl || ''} onChange={setCustomUrl}>
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Target URL</span>
                {urlVars.length > 0 && (
                  <div className="flex items-center gap-1">
                    {urlVars.map(v => (
                      <span
                        className={
                          'font-JetBrainsMono text-[10px] px-1.5 py-0.5 rounded-full ' +
                          'bg-accent/15 text-accent border border-accent/20 font-semibold'
                        }
                        key={v.name}>
                        &#123;&#123;{v.name}&#125;&#125;
                      </span>
                    ))}
                  </div>
                )}
              </Label>
              <InputGroup fullWidth>
                <InputGroup.Prefix className="text-muted">
                  <EarthIcon className="size-4 text-cyan-400" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  className="font-JetBrainsMono text-xs"
                  placeholder="e.g. http://localhost:3000 or https://..."
                />
              </InputGroup>
            </TextField>

            {renderTimingSelector()}
          </motion.div>
        )}

        {urlConfigType === 'htmlFile' && (
          <motion.div
            key="htmlFile"
            exit={{opacity: 0, y: -6}}
            animate={{opacity: 1, y: 0}}
            initial={{opacity: 0, y: -6}}
            transition={{duration: 0.15}}
            className="flex flex-col gap-y-3 pt-1 border-t border-border/30">
            <div className="flex flex-col gap-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>HTML File Path</span>
                {urlVars.length > 0 && (
                  <div className="flex items-center gap-1">
                    {urlVars.map(v => (
                      <span
                        className={
                          'font-JetBrainsMono text-[10px] px-1.5 py-0.5 rounded-full ' +
                          'bg-accent/15 text-accent border border-accent/20 font-semibold'
                        }
                        key={v.name}>
                        &#123;&#123;{v.name}&#125;&#125;
                      </span>
                    ))}
                  </div>
                )}
              </Label>
              <div className="flex items-center gap-x-2 w-full">
                <InputGroup fullWidth>
                  <InputGroup.Prefix className="text-muted">
                    <FileCheckIcon className="size-4 text-emerald-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    value={customUrl || ''}
                    className="font-JetBrainsMono text-xs"
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="Enter or browse path to local HTML file..."
                  />
                </InputGroup>
                <Button
                  size="md"
                  variant="secondary"
                  isPending={isSelectingFile}
                  onPress={handleSelectHtmlFile}
                  className="shrink-0 bg-surface shadow-surface hover:bg-surface-secondary">
                  <FolderOpenIcon className="size-4" />
                  Browse
                </Button>
              </div>
            </div>

            {renderTimingSelector()}
          </motion.div>
        )}

        {urlConfigType === 'findLine' && (
          <motion.div
            key="findLine"
            exit={{opacity: 0, y: -6}}
            animate={{opacity: 1, y: 0}}
            initial={{opacity: 0, y: -6}}
            transition={{duration: 0.15}}
            className="flex flex-col gap-y-2 pt-1 border-t border-border/30">
            <TextField value={findLine} onChange={setFindLine}>
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Terminal Trigger Line</span>
                  <span className="text-[10px] text-muted font-normal">(Auto-extracts URL)</span>
                </div>
                {findLineVars.length > 0 && (
                  <div className="flex items-center gap-1">
                    {findLineVars.map(v => (
                      <span
                        className={
                          'font-JetBrainsMono text-[10px] px-1.5 py-0.5 rounded-full ' +
                          'bg-accent/15 text-accent border border-accent/20 font-semibold'
                        }
                        key={v.name}>
                        &#123;&#123;{v.name}&#125;&#125;
                      </span>
                    ))}
                  </div>
                )}
              </Label>
              <InputGroup fullWidth>
                <InputGroup.Prefix className="text-muted">
                  <Terminal_Icon className="size-4 text-accent" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  className="font-JetBrainsMono text-xs"
                  placeholder='e.g. "Running on local URL:", "Uvicorn running on"'
                />
              </InputGroup>
            </TextField>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
