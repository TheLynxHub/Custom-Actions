import {Button, Dropdown, Label} from '@heroui/react';
import {customActionsChannels} from '@lynx_extension/common/consts';
import {CustomCategory} from '@lynx_extension/common/types';
import {BatchDeleteModal} from '@lynx_extension/renderer/components/modals';
import {toastHolder} from '@lynx_extension/renderer/services';
import {reducerActions, selectCustomCards} from '@lynx_extension/renderer/store';
import {PinIcon, StarIcon} from '@solar-icons/react/bold';
import {
  ClipboardIcon,
  CopyIcon,
  DocumentTextIcon,
  ExportIcon,
  FolderOpenIcon,
  GalleryIcon,
  MusicNotesIcon,
  TrashBin2Icon,
  Widget6Icon,
} from '@solar-icons/react/bold-duotone';
import {AltArrowDownIcon, CheckSquareIcon} from '@solar-icons/react/linear';
import {motion} from 'framer-motion';
import {X} from 'lucide-react';
import {ReactNode, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

type Props = {
  selectedCardIds: string[];
  totalVisibleCount: number;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
};

const CATEGORY_OPTIONS: {id: CustomCategory; name: string; icon: ReactNode}[] = [
  {
    id: 'pinned',
    name: 'Pinned',
    icon: <PinIcon className="size-4 text-amber-500" />,
  },
  {
    id: 'recentlyUsed',
    name: 'Recently Used',
    icon: <StarIcon className="size-4 text-accent" />,
  },
  {
    id: 'all',
    name: 'All Categories',
    icon: <Widget6Icon className="size-4 text-purple-500 dark:text-purple-400" />,
  },
  {
    id: 'image',
    name: 'Image Gen',
    icon: <GalleryIcon className="size-4 text-cyan-600 dark:text-cyan-400" />,
  },
  {
    id: 'text',
    name: 'Text Gen',
    icon: <DocumentTextIcon className="size-4 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    id: 'audio',
    name: 'Audio Gen',
    icon: <MusicNotesIcon className="size-4 text-pink-600 dark:text-pink-400" />,
  },
];

export function BatchActionBar({selectedCardIds, totalVisibleCount, onSelectAllVisible, onClearSelection}: Props) {
  const dispatch = useDispatch();
  const customCards = useSelector(selectCustomCards);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedCards = useMemo(
    () => customCards.filter(card => selectedCardIds.includes(card.id)),
    [customCards, selectedCardIds],
  );

  const selectedTitles = useMemo(() => selectedCards.map(c => c.title || 'Untitled Action'), [selectedCards]);

  const isAllVisibleSelected = selectedCards.length > 0 && selectedCards.length >= totalVisibleCount;

  // Category status helper
  const getCategoryStatus = (catId: CustomCategory): 'all' | 'some' | 'none' => {
    if (selectedCards.length === 0) return 'none';
    const enabledCount = selectedCards.filter(c => Boolean(c.categories?.[catId])).length;
    if (enabledCount === selectedCards.length) return 'all';
    if (enabledCount > 0) return 'some';
    return 'none';
  };

  const handleToggleCategory = (category: CustomCategory, categoryName: string) => {
    const currentStatus = getCategoryStatus(category);
    dispatch(reducerActions.batchToggleCategory({cardIds: selectedCardIds, category}));
    const newStatus = currentStatus === 'all' ? 'removed from' : 'assigned to';
    toastHolder?.top.success(`Category "${categoryName}" ${newStatus} ${selectedCardIds.length} action(s).`);
  };

  const handleBatchDuplicate = () => {
    const count = selectedCardIds.length;
    if (count === 0) return;
    dispatch(reducerActions.batchDuplicateCards(selectedCardIds));
    toastHolder?.top.success(`Successfully duplicated ${count} action${count !== 1 ? 's' : ''}!`);
  };

  const handleExportClipboard = async () => {
    try {
      if (selectedCards.length === 0) return;
      await navigator.clipboard.writeText(JSON.stringify(selectedCards, null, 2));
      toastHolder?.top.success(`Copied ${selectedCards.length} selected action(s) to clipboard!`);
    } catch (err) {
      toastHolder?.top.danger('Failed to copy to clipboard.');
      console.error(err);
    }
  };

  const handleExportFile = async () => {
    try {
      if (selectedCards.length === 0) return;
      const success = await window.electron.ipcRenderer.invoke(customActionsChannels.exportToFile, selectedCards);
      if (success) {
        toastHolder?.top.success(`Exported ${selectedCards.length} action(s) to file!`);
      }
    } catch (err) {
      toastHolder?.top.danger('Failed to export to file.');
      console.error(err);
    }
  };

  const handleConfirmBatchDelete = () => {
    const count = selectedCardIds.length;
    dispatch(reducerActions.batchDeleteCards(selectedCardIds));
    onClearSelection();
    toastHolder?.top.success(`Deleted ${count} action${count !== 1 ? 's' : ''}.`);
  };

  return (
    <>
      <motion.div
        className={
          'sticky bottom-2 z-30 mx-auto mt-3 w-full max-w-2xl rounded-2xl border border-border/80 ' +
          'bg-surface/95 p-2 shadow-2xl backdrop-blur-lg ring-1 ring-border/50 ' +
          'flex flex-row items-center justify-between gap-2.5'
        }
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: 24, scale: 0.96}}
        initial={{opacity: 0, y: 24, scale: 0.96}}
        transition={{duration: 0.2, ease: 'easeOut'}}>
        {/* Left: Count & Quick Select */}
        <div className="flex items-center gap-2 pl-1">
          <span
            className={
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full ' + 'bg-accent/15 text-accent text-xs font-bold'
            }>
            <CheckSquareIcon className="size-3.5" />
            {selectedCardIds.length} selected
          </span>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted hover:text-foreground"
            onPress={isAllVisibleSelected ? onClearSelection : onSelectAllVisible}>
            {isAllVisibleSelected ? 'Deselect All' : `Select All (${totalVisibleCount})`}
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-nowrap justify-end">
          {/* Categories Dropdown */}
          <Dropdown>
            <Dropdown.Trigger>
              <Button size="sm" variant="secondary" className="text-xs">
                <FolderOpenIcon className="size-3.5 text-accent" />
                Categories
                <AltArrowDownIcon className="size-3 text-muted" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={key => {
                  const opt = CATEGORY_OPTIONS.find(c => c.id === key);
                  if (opt) {
                    handleToggleCategory(opt.id, opt.name);
                  }
                }}>
                {CATEGORY_OPTIONS.map(cat => {
                  const status = getCategoryStatus(cat.id);
                  return (
                    <Dropdown.Item
                      id={cat.id}
                      key={cat.id}
                      textValue={cat.name}
                      className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <Label className="text-xs">{cat.name}</Label>
                      </div>
                      <span
                        className={
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ' +
                          (status === 'all'
                            ? 'bg-accent/20 text-accent font-bold'
                            : status === 'some'
                              ? 'bg-amber-500/20 text-amber-500'
                              : 'bg-surface-tertiary text-muted')
                        }>
                        {status === 'all' ? 'All (On)' : status === 'some' ? 'Some' : 'Off'}
                      </span>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Duplicate Button */}
          <Button size="sm" variant="secondary" className="text-xs" onPress={handleBatchDuplicate}>
            <CopyIcon className="size-3.5 text-cyan-600 dark:text-cyan-400" />
            Duplicate
          </Button>

          {/* Export Dropdown */}
          <Dropdown>
            <Dropdown.Trigger>
              <Button size="sm" variant="secondary" className="text-xs">
                <ExportIcon className="size-3.5 text-muted" />
                Export
                <AltArrowDownIcon className="size-3 text-muted" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={key => {
                  if (key === 'export-clipboard') {
                    handleExportClipboard();
                  } else if (key === 'export-file') {
                    handleExportFile();
                  }
                }}>
                <Dropdown.Item id="export-clipboard" textValue="Copy to Clipboard">
                  <ClipboardIcon className="size-4 shrink-0 text-muted" />
                  <Label>Copy to Clipboard</Label>
                </Dropdown.Item>
                <Dropdown.Item id="export-file" textValue="Export to JSON File">
                  <ExportIcon className="size-4 shrink-0 text-muted" />
                  <Label>Export to File</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Delete Button */}
          <Button size="sm" className="text-xs" variant="danger-soft" onPress={() => setIsDeleteModalOpen(true)}>
            <TrashBin2Icon className="size-3.5 text-danger" />
            Delete
          </Button>

          {/* Clear Selection */}
          <Button
            size="sm"
            variant="ghost"
            onPress={onClearSelection}
            aria-label="Clear Selection"
            className="text-muted hover:text-foreground"
            isIconOnly>
            <X className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog for Batch Deletion */}
      <BatchDeleteModal
        isOpen={isDeleteModalOpen}
        cardTitles={selectedTitles}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmBatchDelete}
        selectedCount={selectedCardIds.length}
      />
    </>
  );
}

export default BatchActionBar;
