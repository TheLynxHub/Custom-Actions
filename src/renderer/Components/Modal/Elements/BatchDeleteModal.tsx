import {AlertDialog, Button} from '@heroui/react';
import TabAlertDialog from '@lynx/components/TabAlertDialog';
import {TrashBin2Icon} from '@solar-icons/react/bold-duotone';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedCount: number;
  cardTitles: string[];
  onConfirm: () => void;
};

export function BatchDeleteModal({isOpen, onOpenChange, selectedCount, cardTitles, onConfirm}: Props) {
  return (
    <TabAlertDialog isOpen={isOpen} dialogClassName="max-w-md" onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />
      <AlertDialog.Header>
        <AlertDialog.Icon status="danger" />
        <AlertDialog.Heading>
          Delete {selectedCount} Action{selectedCount !== 1 ? 's' : ''}?
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body className="space-y-3">
        <p className="text-xs text-muted leading-relaxed">
          Are you sure you want to permanently delete{' '}
          {selectedCount === 1 ? (
            <span className="font-semibold text-foreground">&quot;{cardTitles[0] || 'Untitled'}&quot;</span>
          ) : (
            <span className="font-semibold text-foreground">these {selectedCount} custom actions</span>
          )}
          ? This action cannot be undone.
        </p>

        {cardTitles.length > 1 && (
          <div
            className={
              'max-h-28 overflow-y-auto rounded-xl bg-surface-secondary/70 ' + 'p-2 border border-border/50 space-y-1'
            }>
            {cardTitles.slice(0, 5).map((title, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/80 truncate">
                <span className="size-1.5 rounded-full bg-danger shrink-0" />
                <span className="truncate">{title || 'Untitled Action'}</span>
              </div>
            ))}
            {cardTitles.length > 5 && (
              <p className="text-[10px] text-muted pl-3 pt-0.5 font-mono">+{cardTitles.length - 5} more...</p>
            )}
          </div>
        )}
      </AlertDialog.Body>

      <AlertDialog.Footer className="flex items-center justify-end gap-2">
        <Button size="md" variant="secondary" onPress={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onPress={() => {
            onConfirm();
            onOpenChange(false);
          }}
          size="md"
          variant="danger">
          <TrashBin2Icon className="size-4" />
          Delete {selectedCount} Action{selectedCount !== 1 ? 's' : ''}
        </Button>
      </AlertDialog.Footer>
    </TabAlertDialog>
  );
}
