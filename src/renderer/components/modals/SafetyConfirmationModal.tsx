import {AlertDialog, Button} from '@heroui/react';
import TabAlertDialog from '@lynx/components/TabAlertDialog';
import {CustomCard} from '@lynx_extension/common/types';
import {Folder2Icon, PlayCircleIcon, ShieldWarningIcon} from '@solar-icons/react/bold-duotone';
import {useMemo} from 'react';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  card: CustomCard;
  onConfirm: () => void;
};

export function SafetyConfirmationModal({isOpen, onOpenChange, card, onConfirm}: Props) {
  const {title, confirmationMessage, actions, urlConfig, cwd} = card;

  const activeActions = useMemo(() => {
    return (actions || []).filter(a => !a.disabled);
  }, [actions]);

  const targetUrl = useMemo(() => {
    if ((urlConfig?.type === 'custom' || urlConfig?.type === 'htmlFile') && urlConfig.customUrl) {
      return urlConfig.customUrl;
    }
    return null;
  }, [urlConfig]);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <TabAlertDialog isOpen={isOpen} dialogClassName="max-w-lg" onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />
      <AlertDialog.Header className="flex items-center gap-x-2.5">
        <div
          className={
            'flex size-9 shrink-0 items-center justify-center rounded-2xl ' +
            'bg-warning/15 text-warning ring-1 ring-warning/30'
          }>
          <ShieldWarningIcon className="size-5" />
        </div>
        <AlertDialog.Heading className="text-sm font-bold text-foreground truncate">
          Run &quot;{title || 'Untitled Action'}&quot;?
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body className="space-y-3">
        {/* Warning / Custom Note */}
        <p className="text-xs text-muted leading-relaxed">
          {confirmationMessage ||
            'Are you sure you want to execute this action? This shortcut is ' +
              'configured to require confirmation before running.'}
        </p>

        {/* Working Directory Info */}
        {cwd && (
          <div
            className={
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-secondary/70 ' +
              'border border-border/50 text-[11px] text-muted font-mono truncate'
            }>
            <Folder2Icon className="size-3.5 shrink-0 text-accent" />
            <span className="text-muted/70 select-none">cwd:</span>
            <span className="text-foreground truncate">{cwd}</span>
          </div>
        )}

        {/* Command / URL Preview Box */}
        {(activeActions.length > 0 || targetUrl) && (
          <div
            className={
              'flex flex-col gap-1 max-h-36 overflow-y-auto rounded-2xl ' +
              'bg-surface-secondary px-3 py-2 border border-border font-JetBrainsMono text-xs select-all'
            }>
            {activeActions.map((action, idx) => (
              <div key={action.id || idx} className="flex items-start gap-2 text-foreground/90 leading-tight">
                {activeActions.length > 1 && (
                  <span className="text-muted/60 text-[10px] select-none shrink-0 font-sans">{idx + 1}.</span>
                )}
                <span className="break-all whitespace-pre-wrap flex-1">{action.action}</span>
              </div>
            ))}

            {targetUrl && (
              <div
                className={
                  'flex items-start gap-2 text-cyan-600 dark:text-cyan-400 leading-tight ' +
                  (activeActions.length > 0 ? 'pt-1 border-t border-border/30' : '')
                }>
                <span className="text-muted/60 text-[10px] select-none shrink-0 font-sans">URL:</span>
                <span className="break-all whitespace-pre-wrap flex-1">{targetUrl}</span>
              </div>
            )}
          </div>
        )}
      </AlertDialog.Body>

      <AlertDialog.Footer className="flex items-center justify-end gap-2">
        <Button size="md" variant="secondary" onPress={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button size="md" autoFocus={true} variant="danger-soft" onPress={handleConfirm}>
          <PlayCircleIcon className="size-4" />
          Confirm & Run
        </Button>
      </AlertDialog.Footer>
    </TabAlertDialog>
  );
}
