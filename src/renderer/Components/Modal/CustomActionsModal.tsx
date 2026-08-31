import {Button, Dropdown, Label, Modal, ScrollShadow, UseOverlayStateReturn} from '@heroui/react';
import TabModal from '@lynx/components/TabModal';
import {AppDispatch} from '@lynx/redux/store';
import {
  ClipboardIcon,
  CopyIcon,
  DisketteIcon,
  ExportIcon,
  ImportIcon,
  TrashBin2Icon,
  Widget6Icon,
} from '@solar-icons/react/bold-duotone';
import {ArrowLeftIcon} from '@solar-icons/react/line-duotone';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {customActionsChannels} from '../../../cross/CrossUtils';
import {reducerActions, selectCustomCards, selectEditingCard, selectView} from '../../reducer';
import {toastHolder} from '../../toastHolder';
import CustomActionsManager from './CustomActionsManager';

type Props = {state: UseOverlayStateReturn};

export default function CustomActionsModal({state}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  // State for view management
  const view = useSelector(selectView);
  const editingCard = useSelector(selectEditingCard);
  const customCards = useSelector(selectCustomCards);

  // State for card selection
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const handleExportClipboard = async () => {
    try {
      if (customCards.length === 0) {
        toastHolder?.top.danger('No custom cards to export.');
        return;
      }
      await navigator.clipboard.writeText(JSON.stringify(customCards, null, 2));
      toastHolder?.top.success('Copied all custom cards to clipboard!');
    } catch (err) {
      toastHolder?.top.danger('Failed to copy to clipboard.');
      console.error(err);
    }
  };

  const handleExportSelectedClipboard = async () => {
    try {
      const selected = customCards.filter(card => selectedCardIds.includes(card.id));
      if (selected.length === 0) {
        toastHolder?.top.danger('No custom cards selected to export.');
        return;
      }
      await navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
      toastHolder?.top.success(`Copied ${selected.length} selected card(s) to clipboard!`);
    } catch (err) {
      toastHolder?.top.danger('Failed to copy to clipboard.');
      console.error(err);
    }
  };

  const handleImportClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toastHolder?.top.danger('Clipboard is empty.');
        return;
      }
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        dispatch(reducerActions.importCards(parsed));
        toastHolder?.top.success(`Successfully imported ${parsed.length} cards!`);
      } else {
        toastHolder?.top.danger('Clipboard content is not a valid list of cards.');
      }
    } catch (err) {
      toastHolder?.top.danger('Failed to import from clipboard. Ensure valid JSON format.');
      console.error(err);
    }
  };

  const handleExportFile = async () => {
    try {
      if (customCards.length === 0) {
        toastHolder?.top.danger('No custom cards to export.');
        return;
      }
      const success = await window.electron.ipcRenderer.invoke(customActionsChannels.exportToFile, customCards);
      if (success) {
        toastHolder?.top.success('Exported cards to file successfully!');
      }
    } catch (err) {
      toastHolder?.top.danger('Failed to export to file.');
      console.error(err);
    }
  };

  const handleExportSelectedFile = async () => {
    try {
      const selected = customCards.filter(card => selectedCardIds.includes(card.id));
      if (selected.length === 0) {
        toastHolder?.top.danger('No custom cards selected to export.');
        return;
      }
      const success = await window.electron.ipcRenderer.invoke(customActionsChannels.exportToFile, selected);
      if (success) {
        toastHolder?.top.success(`Exported ${selected.length} card(s) to file successfully!`);
      }
    } catch (err) {
      toastHolder?.top.danger('Failed to export to file.');
      console.error(err);
    }
  };

  const handleImportFile = async () => {
    try {
      const parsed = await window.electron.ipcRenderer.invoke(customActionsChannels.importFromFile);
      if (parsed) {
        dispatch(reducerActions.importCards(parsed));
        toastHolder?.top.success(`Successfully imported ${parsed.length} cards from file!`);
      }
    } catch (err: any) {
      toastHolder?.top.danger(err.message || 'Failed to import from file.');
      console.error(err);
    }
  };

  const handleToggleSelectCard = (id: string) => {
    setSelectedCardIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const saveDisabled = useMemo(() => !editingCard?.title || !editingCard.icon, [editingCard]);

  const handleBackToList = useCallback(() => {
    dispatch(reducerActions.setView('list'));
    dispatch(reducerActions.setEditingCard(undefined));
  }, [dispatch]);

  const saveCard = useCallback(() => {
    if (saveDisabled) return;
    dispatch(reducerActions.saveCard());
    toastHolder?.top.success('Card saved successfully!');
  }, [dispatch, saveDisabled]);

  const deleteCard = () => dispatch(reducerActions.removeCard());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'form') {
          handleBackToList();
        } else {
          state.close();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (view === 'form') {
          e.preventDefault();
          saveCard();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleBackToList, saveCard, view, state]);

  const prevIsOpen = useRef(state.isOpen);

  useEffect(() => {
    if (prevIsOpen.current && !state.isOpen) {
      dispatch(reducerActions.setView('list'));
      dispatch(reducerActions.setEditingCard(undefined));
    }
    prevIsOpen.current = state.isOpen;
  }, [state.isOpen, dispatch]);

  useEffect(() => {
    return () => {
      if (state.isOpen) {
        dispatch(reducerActions.setView('list'));
        dispatch(reducerActions.setEditingCard(undefined));
      }
    };
  }, [state.isOpen, dispatch]);

  return (
    <TabModal
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
      dialogClassName="px-0 max-w-5xl"
      isKeyboardDismissDisabled={true}>
      <Modal.CloseTrigger />

      {/* Header */}
      <Modal.Header className="flex-row items-center gap-x-3 px-5">
        {view === 'form' ? (
          <div className="flex items-center gap-x-3 w-full">
            <Button size="sm" variant="ghost" onPress={handleBackToList} aria-label="Back to Actions (Esc)" isIconOnly>
              <ArrowLeftIcon className="size-4.5" />
            </Button>
            <div className="flex items-center gap-x-2 text-sm font-semibold">
              <span
                onClick={handleBackToList}
                className="text-muted hover:text-foreground cursor-pointer transition-colors">
                Custom Actions
              </span>
              <span className="text-muted/50">/</span>
              <span className="text-foreground truncate max-w-md">
                {editingCard?.id && editingCard.id !== 'temp'
                  ? `Edit "${editingCard.title || 'Untitled'}"`
                  : 'Create New Action'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-x-2.5">
            <div className="size-8 text-accent flex items-center justify-center">
              <Widget6Icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <Modal.Heading className="text-sm font-bold text-foreground">Custom Actions</Modal.Heading>
            </div>
          </div>
        )}
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="overflow-hidden">
        <ScrollShadow className="size-full px-5 py-4 max-h-[72vh]">
          <CustomActionsManager selectedCardIds={selectedCardIds} onToggleSelect={handleToggleSelectCard} />
        </ScrollShadow>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="justify-between px-5">
        {view === 'form' ? (
          <div className="flex items-center justify-between w-full">
            {editingCard?.id && editingCard.id !== 'temp' ? (
              <Button size="md" onPress={deleteCard} variant="danger-soft">
                <TrashBin2Icon className="size-4 text-danger" />
                Delete Action
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-x-2">
              <Button size="md" variant="secondary" onPress={handleBackToList}>
                Cancel
              </Button>
              <Button size="md" onPress={saveCard} isDisabled={saveDisabled}>
                <DisketteIcon className="size-4" />
                Save Action
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex items-center gap-x-2">
              <span className="text-xs font-mono text-muted">
                {customCards.length} action{customCards.length !== 1 ? 's' : ''}
              </span>
              {selectedCardIds.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                  {selectedCardIds.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-x-2">
              {selectedCardIds.length > 0 && (
                <Button size="sm" variant="ghost" onPress={() => setSelectedCardIds([])}>
                  Clear Selection
                </Button>
              )}

              <Dropdown>
                <Dropdown.Trigger>
                  <Button size="sm" variant="secondary">
                    <ImportIcon className="size-4 text-accent" />
                    Manage Cards
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    onAction={key => {
                      switch (key) {
                        case 'import-clipboard':
                          handleImportClipboard();
                          break;
                        case 'import-file':
                          handleImportFile();
                          break;
                        case 'export-clipboard-all':
                          handleExportClipboard();
                          break;
                        case 'export-file-all':
                          handleExportFile();
                          break;
                        case 'export-clipboard-selected':
                          handleExportSelectedClipboard();
                          break;
                        case 'export-file-selected':
                          handleExportSelectedFile();
                          break;
                        case 'clear-selection':
                          setSelectedCardIds([]);
                          break;
                        default:
                          break;
                      }
                    }}>
                    <Dropdown.Item id="import-clipboard" textValue="Import from Clipboard">
                      <ClipboardIcon className="size-4 shrink-0 text-muted" />
                      <Label>Import from Clipboard</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="import-file" textValue="Import from JSON File">
                      <ImportIcon className="size-4 shrink-0 text-muted" />
                      <Label>Import from File</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="export-clipboard-all" textValue="Export All to Clipboard">
                      <CopyIcon className="size-4 shrink-0 text-muted" />
                      <Label>Export All to Clipboard</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="export-file-all" textValue="Export All to JSON File">
                      <ExportIcon className="size-4 shrink-0 text-muted" />
                      <Label>Export All to File</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                      id="export-clipboard-selected"
                      isDisabled={selectedCardIds.length === 0}
                      textValue={`Export Selected (${selectedCardIds.length}) to Clipboard`}>
                      <CopyIcon className="size-4 shrink-0 text-muted" />
                      <Label>Export Selected ({selectedCardIds.length}) to Clipboard</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                      id="export-file-selected"
                      isDisabled={selectedCardIds.length === 0}
                      textValue={`Export Selected (${selectedCardIds.length}) to File`}>
                      <ExportIcon className="size-4 shrink-0 text-muted" />
                      <Label>Export Selected ({selectedCardIds.length}) to File</Label>
                    </Dropdown.Item>
                    {selectedCardIds.length > 0 && (
                      <Dropdown.Item variant="danger" id="clear-selection" textValue="Clear Selection">
                        <TrashBin2Icon className="size-4 shrink-0 text-danger" />
                        <Label>Clear Selection</Label>
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        )}
      </Modal.Footer>
    </TabModal>
  );
}
