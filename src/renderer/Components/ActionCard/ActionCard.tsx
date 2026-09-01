import {Button, Tooltip, useOverlayState} from '@heroui/react';
import {ToolsCard} from '@lynx/components/ToolsCard';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {tabsActions, useTabsState} from '@lynx/redux/reducers/tabs';
import {SvgProps} from '@lynx_assets/icons/types';
import {PageTitleByPageId} from '@lynx_common/consts';
import {ptyChannels} from '@lynx_common/consts/ipcChannels/pty';
import {formatLocalPathToUrl} from '@lynx_common/utils';
import browserIpc from '@lynx_shared/ipc/browser';
import filesIpc from '@lynx_shared/ipc/files';
import ptyIpc from '@lynx_shared/ipc/pty';
import {StopIcon} from '@solar-icons/react/bold';
import {PenIcon} from '@solar-icons/react/bold-duotone';
import {ReactElement, useCallback, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomCard} from '../../../cross/CrossTypes';
import {customActionsChannels} from '../../../cross/CrossUtils';
import {resolvePathShortcuts} from '../../../cross/pathShortcuts';
import {hasTemplateVariables} from '../../../cross/templateVariables';
import {reducerActions, selectRunningExecutions, selectSystemPaths} from '../../reducer';
import CustomActionsModal from '../Modal/CustomActionsModal';
import {SafetyConfirmationModal} from '../Modal/SafetyConfirmationModal';
import {VariablePromptModal} from '../Modal/VariablePromptModal';

type Props = {
  icon: (props: SvgProps) => ReactElement;
  onClick?: () => void;
  card: CustomCard;
};

const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';
const IS_MACOS = window.osPlatform === 'darwin';
const IS_WINDOWS = window.osPlatform === 'win32';

export default function ActionCard({icon: Icon, card}: Props) {
  const dispatch = useDispatch();
  const systemPaths = useSelector(selectSystemPaths);
  const runningExecutions = useSelector(selectRunningExecutions);

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const modalState = useOverlayState();
  const promptModalState = useOverlayState();
  const confirmModalState = useOverlayState();

  const [pendingCard, setPendingCard] = useState<CustomCard>(card);

  const {title, description} = card;
  const isPinned = Boolean(card.categories?.pinned);

  const handleTogglePin = useCallback(() => {
    dispatch(reducerActions.batchToggleCategory({cardIds: [card.id], category: 'pinned'}));
  }, [card.id, dispatch]);

  const runningExecution = useMemo(
    () => runningExecutions.find(item => item.cardId === card.id),
    [runningExecutions, card.id],
  );
  const isRunning = Boolean(runningExecution);

  const executeCard = useCallback(
    (targetCard: CustomCard) => {
      const resolvedCwd = targetCard.cwd ? resolvePathShortcuts(targetCard.cwd, systemPaths) : undefined;
      const activeActions = (targetCard.actions || []).filter(action => !action.disabled);
      const opens = activeActions.filter(action => action.type === 'open');
      opens.forEach(open => {
        const resolvedPath = resolvePathShortcuts(open.action, systemPaths);
        filesIpc.openPath(resolvedPath);
      });

      const manageUrls = (ptyId: string, onDone?: () => void) => {
        const {urlConfig} = targetCard;
        if ((urlConfig.type === 'custom' || urlConfig.type === 'htmlFile') && urlConfig.customUrl) {
          const openUrl = () => {
            let address = resolvePathShortcuts(urlConfig.customUrl!, systemPaths);
            if (
              urlConfig.type === 'htmlFile' ||
              address.startsWith('file://') ||
              address.match(/^[a-zA-Z]:[\\/]/) ||
              address.startsWith('/')
            ) {
              address = formatLocalPathToUrl(address);
            }
            dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address}));
            if (onDone) onDone();
          };

          if (urlConfig.openImmediately) {
            openUrl();
          } else {
            setTimeout(() => openUrl(), (urlConfig.timeout || 0) * 1000);
          }
        } else if (urlConfig.type === 'findLine' && urlConfig.findLine) {
          // Start URL catching session in redux (handled by CustomHooks)
          dispatch(reducerActions.startUrlCatching({ptyId, tabId: activeTab, findLine: urlConfig.findLine}));
        }
      };

      const getScriptCommand = (scriptPath: string): string => {
        const ext = scriptPath.substring(scriptPath.lastIndexOf('.')).toLowerCase();

        if (IS_WINDOWS) {
          // Windows: Use appropriate interpreter based on extension
          switch (ext) {
            case '.py':
              return `python "${scriptPath}"${LINE_ENDING}`;
            case '.js':
              return `node "${scriptPath}"${LINE_ENDING}`;
            default:
              return `& "${scriptPath}"${LINE_ENDING}`;
          }
        } else if (IS_MACOS) {
          // macOS: Handle .app bundles and scripts
          if (scriptPath.endsWith('.app')) {
            return `open -W "${scriptPath}"${LINE_ENDING}`;
          } else if (ext === '.command') {
            return `chmod +x "${scriptPath}" && open "${scriptPath}"${LINE_ENDING}`;
          } else if (ext === '.py') {
            return `python3 "${scriptPath}"${LINE_ENDING}`;
          } else if (ext === '.js') {
            return `node "${scriptPath}"${LINE_ENDING}`;
          } else {
            // For .sh and other scripts, use bash as fallback interpreter
            return `chmod +x "${scriptPath}" && bash "${scriptPath}"${LINE_ENDING}`;
          }
        } else {
          // Linux: Detect interpreter based on extension or use bash as fallback
          switch (ext) {
            case '.py':
              return `python3 "${scriptPath}"${LINE_ENDING}`;
            case '.js':
              return `node "${scriptPath}"${LINE_ENDING}`;
            case '.rb':
              return `ruby "${scriptPath}"${LINE_ENDING}`;
            case '.pl':
              return `perl "${scriptPath}"${LINE_ENDING}`;
            default:
              // Use bash as fallback for .sh and unknown scripts
              return `chmod +x "${scriptPath}" && bash "${scriptPath}"${LINE_ENDING}`;
          }
        }
      };

      const writeEnvVars = (ptyId: string) => {
        if (targetCard.env && targetCard.env.length > 0) {
          targetCard.env.forEach(envVar => {
            if (envVar.key && envVar.key.trim()) {
              if (IS_WINDOWS) {
                ptyIpc.write(ptyId, `$env:${envVar.key.trim()}="${envVar.value}"${LINE_ENDING}`);
              } else {
                ptyIpc.write(ptyId, `export ${envVar.key.trim()}="${envVar.value}"${LINE_ENDING}`);
              }
            }
          });
        }
      };

      const runCustomCommands = (ptyId: string) => {
        writeEnvVars(ptyId);
        activeActions.forEach(action => {
          if (action.type === 'command') {
            ptyIpc.write(ptyId, `${action.action}${LINE_ENDING}`);
          } else if (action.type === 'script') {
            ptyIpc.write(ptyId, getScriptCommand(action.action));
          }
        });
      };

      switch (targetCard.cardType) {
        case 'executable': {
          const pathToExe = activeActions.find(action => action.type === 'exe')?.action;
          if (!pathToExe) return;

          const ptyID = `${activeTab}_both`;
          const envObj: Record<string, string> = {};
          targetCard.env?.forEach(item => {
            if (item.key.trim()) envObj[item.key.trim()] = item.value;
          });
          const resolvedExe = resolvePathShortcuts(pathToExe, systemPaths);
          window.electron.ipcRenderer.send(customActionsChannels.startExe, ptyID, resolvedExe, envObj, resolvedCwd);

          dispatch(cardsActions.addRunningCard({tabId: activeTab, id: ptyID}));
          dispatch(
            reducerActions.addRunningExecution({
              cardId: targetCard.id,
              tabId: activeTab,
              ptyId: ptyID,
              cardType: targetCard.cardType,
              startedAt: Date.now(),
            }),
          );
          manageUrls(ptyID, () => {
            dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'browser'}));
          });

          break;
        }
        case 'browser': {
          const ptyID = `${activeTab}_browser`;
          dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: 'browser', dir: resolvedCwd}));
          dispatch(
            reducerActions.addRunningExecution({
              cardId: targetCard.id,
              tabId: activeTab,
              ptyId: ptyID,
              cardType: targetCard.cardType,
              startedAt: Date.now(),
            }),
          );
          manageUrls(ptyID);
          break;
        }
        case 'terminal': {
          const ptyID = `${activeTab}_terminal`;
          dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: 'terminal', dir: resolvedCwd}));
          dispatch(
            reducerActions.addRunningExecution({
              cardId: targetCard.id,
              tabId: activeTab,
              ptyId: ptyID,
              cardType: targetCard.cardType,
              startedAt: Date.now(),
            }),
          );
          manageUrls(ptyID);
          setTimeout(() => runCustomCommands(ptyID), 100);
          break;
        }
        case 'terminal_browser': {
          const ptyID = `${activeTab}_both`;
          dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: 'both', dir: resolvedCwd}));
          dispatch(
            reducerActions.addRunningExecution({
              cardId: targetCard.id,
              tabId: activeTab,
              ptyId: ptyID,
              cardType: targetCard.cardType,
              startedAt: Date.now(),
            }),
          );
          manageUrls(ptyID, () => {
            dispatch(cardsActions.setRunningCardView({tabId: activeTab, view: 'browser'}));
          });
          setTimeout(() => runCustomCommands(ptyID), 100);
          break;
        }
      }
    },
    [activeTab, dispatch, systemPaths],
  );

  const handleStopExecution = useCallback(
    (e?: unknown) => {
      if (e && typeof (e as {stopPropagation?: () => void}).stopPropagation === 'function') {
        (e as {stopPropagation: () => void}).stopPropagation();
      }
      if (!runningExecution) return;

      const {ptyId, tabId, cardType} = runningExecution;

      // 1. Send interrupt signal and stop PTY / child process tree
      if (cardType !== 'browser') {
        try {
          ptyIpc.write(ptyId, '\x03');
        } catch {
          // Process might already be closing
        }
        ptyIpc.stop(ptyId);
        if (cardType === 'executable') {
          window.electron.ipcRenderer.send(ptyChannels.stopProcess, ptyId);
        }
      }

      // 2. Remove browser view if any
      browserIpc.send.removeBrowser(ptyId);

      // 3. Stop running card in LynxHub Redux state
      dispatch(cardsActions.stopRunningCard({tabId}));

      // 4. Restore tab title and reset tab terminal/progress/favicon state
      const targetTab = tabs.find(t => t.id === tabId);
      const restoredTitle =
        (targetTab && PageTitleByPageId[targetTab.pageID as keyof typeof PageTitleByPageId]) || 'Home';
      dispatch(tabsActions.setTabTitle({tabID: tabId, title: restoredTitle}));
      dispatch(tabsActions.setTabIsTerminal({tabID: tabId, isTerminal: false}));
      dispatch(tabsActions.setTabFavIcon({tabID: tabId, show: false, url: ''}));
      dispatch(tabsActions.setTabProgress({tabID: tabId, progress: undefined}));

      // 5. Remove execution from custom actions state
      dispatch(reducerActions.removeRunningExecution({cardId: card.id}));
    },
    [runningExecution, card.id, tabs, dispatch],
  );

  const handleCardPress = () => {
    if (isRunning && runningExecution) {
      dispatch(tabsActions.setActiveTab(runningExecution.tabId));
      return;
    }

    if (hasTemplateVariables(card)) {
      promptModalState.open();
    } else if (card.requireConfirmation) {
      setPendingCard(card);
      confirmModalState.open();
    } else {
      executeCard(card);
    }
  };

  const handleVariableExecute = (resolvedCard: CustomCard) => {
    if (card.requireConfirmation) {
      setPendingCard(resolvedCard);
      confirmModalState.open();
    } else {
      executeCard(resolvedCard);
    }
  };

  const openConfig = (e?: unknown) => {
    if (e && typeof (e as {stopPropagation?: () => void}).stopPropagation === 'function') {
      (e as {stopPropagation: () => void}).stopPropagation();
    }
    dispatch(reducerActions.setEditingCard(card));
    dispatch(reducerActions.setView('form'));
    modalState.open();
  };

  const renderIcon = () => {
    if (!isRunning) {
      return <Icon className="size-8" id={runningExecution?.tabId} />;
    }

    return (
      <Tooltip delay={150}>
        <Tooltip.Trigger>
          <div className="relative size-8 flex items-center justify-center">
            <Icon className="size-8 text-emerald-500 dark:text-emerald-400" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">Process Running</p>
          <p className="text-[10px] text-muted">Click card to view session tab</p>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  const renderFooter = () => {
    if (isRunning) {
      return (
        <div onClick={e => e.stopPropagation()} className="flex items-center justify-between w-full">
          <div
            className={
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 absolute top-4 right-4 ' +
              'border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none'
            }>
            <span>Running</span>
          </div>

          <div />

          <div className="flex items-center gap-1.5">
            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="danger-soft"
                  onPress={handleStopExecution}
                  className="shrink-0 font-medium"
                  aria-label="Stop running process"
                  isIconOnly>
                  <StopIcon className="size-3.5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs font-medium">Stop Process</p>
              </Tooltip.Content>
            </Tooltip>

            <Tooltip delay={150}>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  variant="tertiary"
                  onPress={openConfig}
                  className="shrink-0"
                  aria-label="Edit card"
                  isIconOnly>
                  <PenIcon className="text-semi-muted size-3.5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs">Edit Action</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      );
    }

    return (
      <Button size="sm" variant="tertiary" onPress={openConfig} className="shrink-0" aria-label="Edit card" isIconOnly>
        <PenIcon className="text-semi-muted size-3.5" />
      </Button>
    );
  };

  return (
    <>
      <ToolsCard
        description={
          description ||
          'No description provided. Click to execute this action, run scripts, or open the' +
            ' configured URL in your workspace.'
        }
        id={card.id}
        title={title}
        icon={renderIcon()}
        isPinned={isPinned}
        footer={renderFooter()}
        onPress={handleCardPress}
        onPinPress={handleTogglePin}
        avatarClassName={isRunning ? 'ring-emerald-500 dark:ring-emerald-400 ring-2 animate-pulse' : 'ring-cyan-500'}
      />
      <CustomActionsModal state={modalState} />
      <VariablePromptModal
        card={card}
        isOpen={promptModalState.isOpen}
        onExecute={handleVariableExecute}
        onOpenChange={promptModalState.setOpen}
        cardIcon={<Icon className="size-full" />}
      />
      <SafetyConfirmationModal
        card={pendingCard}
        isOpen={confirmModalState.isOpen}
        onOpenChange={confirmModalState.setOpen}
        onConfirm={() => executeCard(pendingCard)}
      />
    </>
  );
}
