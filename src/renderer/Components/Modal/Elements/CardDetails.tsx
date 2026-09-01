import {Input, Label, Switch, TextField} from '@heroui/react';
import {ShieldWarningIcon} from '@solar-icons/react/bold-duotone';
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {reducerActions, selectEditingCard} from '../../../reducer';
import {CardIcon, CardIconsList} from '../../CardIcons';

export function CardDetails() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);

  const [title, setTitle] = useState<string>(editingCard?.title || '');
  const [desc, setDesc] = useState<string>(editingCard?.description || '');
  const [confirmMsg, setConfirmMsg] = useState<string>(editingCard?.confirmationMessage || '');

  const requireConfirmation = Boolean(editingCard?.requireConfirmation);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const changeIcon = (icon: string) => {
    dispatch(reducerActions.setIcon(icon));
  };

  const isFirstTitleRender = useRef(true);
  const isFirstDescRender = useRef(true);
  const isFirstConfirmMsgRender = useRef(true);

  useEffect(() => {
    if (isFirstTitleRender.current) {
      isFirstTitleRender.current = false;
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      dispatch(reducerActions.setTitle(title));
    }, 150);
  }, [title]);

  useEffect(() => {
    if (isFirstDescRender.current) {
      isFirstDescRender.current = false;
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      dispatch(reducerActions.setDescription(desc));
    }, 150);
  }, [desc]);

  useEffect(() => {
    if (isFirstConfirmMsgRender.current) {
      isFirstConfirmMsgRender.current = false;
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      dispatch(reducerActions.setConfirmationMessage(confirmMsg));
    }, 150);
  }, [confirmMsg]);

  const selectedIcon = editingCard?.icon || 'bot';

  return (
    <div className="flex flex-col gap-y-3.5">
      {/* Title & Description Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextField value={title} onChange={setTitle} isRequired>
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Action Title</span>
            <span className="text-[10px] text-muted font-normal">Required</span>
          </Label>
          <Input placeholder="e.g. Start Dev Server" fullWidth />
        </TextField>

        <TextField value={desc} onChange={setDesc}>
          <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Description</span>
            <span className="text-[10px] text-muted font-normal">Optional</span>
          </Label>
          <Input placeholder="Optional short summary..." fullWidth />
        </TextField>
      </div>

      {/* Safety Confirmation Guard */}
      <div className="flex flex-col gap-y-2.5 p-3 rounded-3xl bg-surface border border-border">
        <Switch
          size="sm"
          className="w-full"
          isSelected={requireConfirmation}
          onChange={val => dispatch(reducerActions.setRequireConfirmation(val))}>
          <Switch.Content className="flex items-center justify-between w-full">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldWarningIcon className="size-4 text-warning" />
                Require Confirmation Before Running
              </span>
              <span className="text-[11px] text-muted leading-tight mt-0.5">
                Prompts for safety confirmation before executing commands or opening URLs.
              </span>
            </div>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>

        {requireConfirmation && (
          <div className="pt-2 border-t border-border/30">
            <TextField value={confirmMsg} variant="secondary" onChange={setConfirmMsg}>
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Custom Warning Note</span>
                <span className="text-[10px] text-muted font-normal">Optional</span>
              </Label>
              <Input placeholder="e.g. This will drop local SQLite tables and rebuild Docker containers." fullWidth />
            </TextField>
          </div>
        )}
      </div>

      {/* Icon Picker Section */}
      <div className="flex flex-col gap-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Icon</span>
          <div
            className={
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full ' + 'bg-surface-tertiary border border-border/50'
            }>
            <div className="size-3.5 shrink-0 flex items-center justify-center">
              <CardIcon id={selectedIcon} className="size-full" />
            </div>
            <span className="font-semibold text-foreground capitalize text-[11px]">{selectedIcon}</span>
          </div>
        </div>

        {/* Compact Icon Strip */}
        <div
          className={
            'flex flex-wrap justify-center items-center gap-2 p-3 rounded-3xl bg-surface/40 border border-border/30'
          }>
          {CardIconsList.map(icon => {
            const isSelected = selectedIcon === icon;
            return (
              <button
                className={
                  'flex size-13.5 shrink-0 items-center justify-center rounded-full border ' +
                  'transition-all duration-150 cursor-pointer ' +
                  (isSelected
                    ? 'border-accent bg-accent/20 ring-1 ring-accent text-accent shadow-xs scale-105'
                    : 'border-border/40 bg-surface/60 hover:bg-surface-hover hover:border-border ' +
                      'text-muted hover:text-foreground shadow-surface')
                }
                key={icon}
                title={icon}
                type="button"
                onClick={() => changeIcon(icon)}>
                <div className="size-7 flex items-center justify-center">
                  <CardIcon id={icon} className="size-full" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
