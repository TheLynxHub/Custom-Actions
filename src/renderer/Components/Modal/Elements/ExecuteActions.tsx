import {Button, ButtonGroup, Input, InputGroup} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import {CheckCircleIcon, CloseCircleIcon, PlayCircleIcon} from '@solar-icons/react/bold';
import {Code2Icon, FileCheckIcon, FolderOpenIcon, PenIcon, TrashBin2Icon} from '@solar-icons/react/bold-duotone';
import {Reorder} from 'framer-motion';
import {GripVertical, Plus} from 'lucide-react';
import {KeyboardEvent, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomExecuteActions} from '../../../../cross/CrossTypes';
import {reducerActions, selectEditingCard} from '../../../reducer';
import {AddExe} from './AddExe';
import {AddScript} from './AddScript';

export function ExecuteActions() {
  const dispatch = useDispatch();
  const [commandInput, setCommandInput] = useState<string>('');
  const editingCard = useSelector(selectEditingCard);

  const [addingFile, setAddingFile] = useState<boolean>(false);
  const [addingFolder, setAddingFolder] = useState<boolean>(false);
  const [addingCdFolder, setAddingCdFolder] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const rawActions = useMemo(() => editingCard?.actions || [], [editingCard?.actions]);
  const cardType = useMemo(() => editingCard?.cardType || 'terminal_browser', [editingCard?.cardType]);

  const [actions, setActions] = useState<CustomExecuteActions[]>(rawActions);
  const actionsRef = useRef(actions);

  useEffect(() => {
    setActions(rawActions);
    actionsRef.current = rawActions;
  }, [rawActions]);

  const handleAddCommand = () => {
    if (commandInput.trim()) {
      dispatch(reducerActions.addAction({action: commandInput.trim(), type: 'command'}));
      setCommandInput('');
    }
  };

  const handleCommandKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCommand();
    }
  };

  const handleRemoveCommand = (indexToRemove: number) => {
    dispatch(reducerActions.removeAction(indexToRemove));
  };

  const handleStartEdit = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      dispatch(reducerActions.updateAction({index: editingIndex, newAction: editingValue.trim()}));
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const onReorder = (newOrder: CustomExecuteActions[]) => {
    actionsRef.current = newOrder;
    setActions(newOrder);
  };

  const handleDragEnd = () => {
    dispatch(reducerActions.setActions(actionsRef.current));
  };

  const handleAddFile = () => {
    setAddingFile(true);
    filesIpc.openDlg({properties: ['openFile']}).then(action => {
      if (action) dispatch(reducerActions.addAction({action, type: 'open'}));
      setAddingFile(false);
    });
  };

  const handleAddFolder = () => {
    setAddingFolder(true);
    filesIpc.openDlg({properties: ['openDirectory']}).then(action => {
      if (action) dispatch(reducerActions.addAction({action, type: 'open'}));
      setAddingFolder(false);
    });
  };

  const handleAddCdFolder = () => {
    setAddingCdFolder(true);
    filesIpc.openDlg({properties: ['openDirectory']}).then(action => {
      if (action) dispatch(reducerActions.addAction({action: `cd "${action}"`, type: 'command'}));
      setAddingCdFolder(false);
    });
  };

  const renderBadge = (type: CustomExecuteActions['type']) => {
    switch (type) {
      case 'command':
        return (
          <span
            className={
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ' +
              'font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/10 shrink-0'
            }>
            <Code2Icon className="size-3" />
            Command
          </span>
        );
      case 'script':
        return (
          <span
            className={
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ' +
              'font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/10 shrink-0'
            }>
            <Code2Icon className="size-3" />
            Script
          </span>
        );
      case 'exe':
        return (
          <span
            className={
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ' +
              'font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/10 shrink-0'
            }>
            <PlayCircleIcon className="size-3" />
            Executable
          </span>
        );
      case 'open':
        return (
          <span
            className={
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ' +
              'font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 ' +
              'border border-emerald-500/10 shrink-0'
            }>
            <FolderOpenIcon className="size-3" />
            Open Path
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-y-2.5">
        {(cardType === 'terminal_browser' || cardType === 'terminal') && (
          <div className="flex items-center gap-x-2">
            <InputGroup fullWidth>
              <InputGroup.Prefix className="text-muted">
                <Terminal_Icon className="size-4 text-accent" />
              </InputGroup.Prefix>
              <InputGroup.Input
                value={commandInput}
                onKeyDown={handleCommandKeyDown}
                className="font-JetBrainsMono text-xs"
                onChange={e => setCommandInput(e.target.value)}
                placeholder="Type shell command and press Enter (e.g. npm run dev)..."
              />
            </InputGroup>
            <Button
              size="md"
              variant="secondary"
              onPress={handleAddCommand}
              isDisabled={!commandInput.trim()}
              className="bg-surface shadow-surface hover:bg-surface/50">
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cardType === 'executable' ? (
            <AddExe />
          ) : cardType === 'terminal_browser' || cardType === 'terminal' ? (
            <AddScript />
          ) : null}

          <ButtonGroup variant="secondary">
            {(cardType === 'terminal_browser' || cardType === 'terminal') && (
              <Button
                size="sm"
                isPending={addingCdFolder}
                onPress={handleAddCdFolder}
                className="bg-surface shadow-surface hover:bg-surface/50">
                {!addingCdFolder && <FolderOpenIcon className="size-3.5" />}
                CD Folder
              </Button>
            )}
            <Button
              size="sm"
              isPending={addingFile}
              onPress={handleAddFile}
              className="bg-surface shadow-surface hover:bg-surface/50">
              {!addingFile && <FileCheckIcon className="size-3.5" />}
              File
            </Button>
            <Button
              size="sm"
              isPending={addingFolder}
              onPress={handleAddFolder}
              className="bg-surface shadow-surface hover:bg-surface/50">
              {!addingFolder && <FolderOpenIcon className="size-3.5" />}
              Folder
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Action Pipeline List */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-foreground">Execution Pipeline</span>
          {actions.length > 0 && (
            <span className="text-[11px] text-muted font-mono">
              {actions.length} step{actions.length !== 1 ? 's' : ''} (sequential)
            </span>
          )}
        </div>

        {actions.length === 0 ? (
          <div
            className={
              'flex items-center justify-center gap-2 p-3.5 rounded-3xl border border-dashed ' +
              'border-border bg-surface/50 text-center text-xs text-muted'
            }>
            <Terminal_Icon className="size-4 text-muted/60" />
            <span>No actions configured. Add a shell command, script, or path above.</span>
          </div>
        ) : (
          <Reorder.Group axis="y" values={actions} onReorder={onReorder} className="flex flex-col gap-y-2">
            {actions.map((item, index) => {
              const isEditing = editingIndex === index;
              return (
                <Reorder.Item
                  className={
                    'group relative flex items-center justify-between gap-x-3 p-2.5 rounded-xl ' +
                    'border border-border/60 bg-surface/70 hover:border-border hover:bg-surface-hover/70 ' +
                    'shadow-2xs select-none'
                  }
                  value={item}
                  onDragEnd={handleDragEnd}
                  key={item.id || `action-${index}`}
                  whileDrag={{scale: 1.015, zIndex: 50, boxShadow: '0 8px 20px rgba(0,0,0,0.15)'}}>
                  <div className="flex items-center gap-x-2 min-w-0 flex-1">
                    <div
                      className={
                        'cursor-grab active:cursor-grabbing text-muted/50 ' + 'group-hover:text-muted shrink-0 p-0.5'
                      }>
                      <GripVertical className="size-4" />
                    </div>

                    <span
                      className={'size-4 flex items-center justify-center text-[9pt] font-bold text-muted shrink-0'}>
                      {index + 1}
                    </span>

                    <div className="flex items-center w-26">{renderBadge(item.type)}</div>

                    {isEditing ? (
                      <div className="flex items-center gap-x-2 flex-1 min-w-0">
                        <Input
                          value={editingValue}
                          onBlur={handleSaveEdit}
                          onKeyDown={handleEditKeyDown}
                          className="font-JetBrainsMono text-xs"
                          onChange={e => setEditingValue(e.target.value)}
                          fullWidth
                          autoFocus
                        />
                        <Button size="sm" aria-label="Save" variant="tertiary" onPress={handleSaveEdit} isIconOnly>
                          <CheckCircleIcon className="size-3.5 text-accent" />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Cancel" onPress={handleCancelEdit} isIconOnly>
                          <CloseCircleIcon className="size-3.5 text-muted" />
                        </Button>
                      </div>
                    ) : (
                      <span
                        className={
                          'font-JetBrainsMono text-xs text-foreground truncate min-w-0 ' +
                          'flex-1 px-1.5 py-0.5 select-all'
                        }>
                        {item.action}
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-x-1 shrink-0">
                      {item.type === 'command' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Edit command"
                          onPress={() => handleStartEdit(index, item.action)}
                          isIconOnly>
                          <PenIcon className="size-3.5 text-muted hover:text-foreground" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger-soft"
                        aria-label="Remove action"
                        onPress={() => handleRemoveCommand(index)}
                        className="bg-transparent hover:bg-danger-soft-hover"
                        isIconOnly>
                        <TrashBin2Icon className="size-4 text-danger" />
                      </Button>
                    </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
