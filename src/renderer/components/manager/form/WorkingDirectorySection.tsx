import {Button, InputGroup} from '@heroui/react';
import {PATH_SHORTCUTS} from '@lynx_extension/common/consts';
import {extractTemplateVariables, resolvePathShortcuts} from '@lynx_extension/common/utils';
import {reducerActions, selectEditingCard, selectSystemPaths} from '@lynx_extension/renderer/store';
import filesIpc from '@lynx_shared/ipc/files';
import {CloseCircleIcon} from '@solar-icons/react/bold';
import {
  DocumentTextIcon,
  DownloadMinimalisticIcon,
  Folder2Icon,
  FolderOpenIcon,
  Home2Icon,
  InfoCircleIcon,
  MonitorIcon,
} from '@solar-icons/react/bold-duotone';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

export function WorkingDirectorySection() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);
  const systemPaths = useSelector(selectSystemPaths);

  const initialCwd = editingCard?.cwd || '';
  const [cwdInput, setCwdInput] = useState<string>(initialCwd);
  const [isPickingFolder, setIsPickingFolder] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setCwdInput(editingCard?.cwd || '');
  }, [editingCard?.cwd]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      dispatch(reducerActions.setCwd(cwdInput.trim()));
    }, 150);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [cwdInput, dispatch]);

  const handleBrowseFolder = useCallback(async () => {
    setIsPickingFolder(true);
    try {
      const selected = await filesIpc.openDlg({
        properties: ['openDirectory'],
        title: 'Select Working Directory',
      });
      if (selected) {
        setCwdInput(selected);
        dispatch(reducerActions.setCwd(selected));
      }
    } finally {
      setIsPickingFolder(false);
    }
  }, [dispatch]);

  const handleShortcutClick = useCallback(
    (shortcutId: string) => {
      setCwdInput(shortcutId);
      dispatch(reducerActions.setCwd(shortcutId));
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    setCwdInput('');
    dispatch(reducerActions.setCwd(''));
  }, [dispatch]);

  // Live preview of resolved path
  const resolvedPreview = useMemo(() => {
    if (!cwdInput.trim()) return null;
    const hasVars = extractTemplateVariables(cwdInput).length > 0;
    const resolved = resolvePathShortcuts(cwdInput, systemPaths);
    return {
      resolved,
      hasVars,
      isShortcut: PATH_SHORTCUTS.some(s => s.id.toLowerCase() === cwdInput.trim().toLowerCase()),
    };
  }, [cwdInput, systemPaths]);

  const getShortcutIcon = (key: string) => {
    switch (key) {
      case 'home':
        return <Home2Icon className="size-3 text-accent" />;
      case 'desktop':
        return <MonitorIcon className="size-3 text-cyan-500" />;
      case 'downloads':
        return <DownloadMinimalisticIcon className="size-3 text-emerald-500" />;
      case 'documents':
        return <DocumentTextIcon className="size-3 text-amber-500" />;
      default:
        return <Folder2Icon className="size-3 text-accent" />;
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      {/* CWD Input & Browse Button */}
      <div className="flex items-center gap-x-2">
        <InputGroup fullWidth>
          <InputGroup.Prefix className="text-muted">
            <FolderOpenIcon className="size-4 text-accent" />
          </InputGroup.Prefix>
          <InputGroup.Input
            value={cwdInput}
            className="font-JetBrainsMono text-xs"
            onChange={e => setCwdInput(e.target.value)}
            placeholder="e.g. %WORKSPACE%, %HOME%/dev/my-app, C:\projects... (Optional)"
          />
          {cwdInput && (
            <InputGroup.Suffix>
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear working directory"
                className="text-muted hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer">
                <CloseCircleIcon className="size-3.5" />
              </button>
            </InputGroup.Suffix>
          )}
        </InputGroup>

        <Button
          size="md"
          variant="secondary"
          isPending={isPickingFolder}
          onPress={handleBrowseFolder}
          className="bg-surface shadow-surface hover:bg-surface/50 shrink-0">
          {!isPickingFolder && <FolderOpenIcon className="size-4 text-accent" />}
          Browse
        </Button>
      </div>

      {/* Preset Path Shortcut Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-muted mr-1">Shortcuts:</span>
        {PATH_SHORTCUTS.map(shortcut => {
          const isActive = cwdInput.trim().toLowerCase() === shortcut.id.toLowerCase();
          return (
            <button
              className={
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono ' +
                'transition-all duration-150 cursor-pointer border ' +
                (isActive
                  ? 'bg-accent/15 border-accent text-accent font-semibold shadow-xs'
                  : 'bg-surface/60 hover:bg-surface-hover border-border/50 text-muted hover:text-foreground')
              }
              type="button"
              key={shortcut.id}
              onClick={() => handleShortcutClick(shortcut.id)}
              title={`${shortcut.description} (${shortcut.id})`}>
              {getShortcutIcon(shortcut.key)}
              <span>{shortcut.id}</span>
            </button>
          );
        })}
      </div>

      {/* Live Resolved Path Preview or Description */}
      {resolvedPreview ? (
        <div
          className={
            'flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface-secondary/70 ' +
            'border border-border/60 text-[11px] font-mono text-muted overflow-hidden'
          }>
          <span className="text-foreground font-semibold shrink-0">Target CWD:</span>
          <span title={resolvedPreview.resolved} className="truncate select-all text-accent">
            {resolvedPreview.resolved}
          </span>
          {resolvedPreview.hasVars && (
            <span
              className={
                'text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 ' + 'text-accent font-sans shrink-0 font-semibold'
              }>
              Dynamic Variable
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-muted px-1">
          <InfoCircleIcon className="size-3.5 text-muted/70 shrink-0" />
          <span>
            Commands and scripts will execute inside this directory by default without needing manual{' '}
            <code className="font-JetBrainsMono font-semibold text-foreground">cd</code> steps.
          </span>
        </div>
      )}
    </div>
  );
}

export default WorkingDirectorySection;
