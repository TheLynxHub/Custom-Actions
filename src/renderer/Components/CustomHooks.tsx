import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {tabsActions, useTabsState} from '@lynx/redux/reducers/tabs';
import {PageTitleByPageId} from '@lynx_common/consts';
import browserIpc from '@lynx_shared/ipc/browser';
import ptyIpc from '@lynx_shared/ipc/pty';
import {isEmpty} from 'lodash-es';
import {Fragment, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {sanitizeCards} from '../../cross/cardSanitizer';
import {customActionsChannels} from '../../cross/CrossUtils';
import {
  reducerActions,
  selectCustomCards,
  selectRunningExecutions,
  selectSaveCards,
  selectUrlCatchingSession,
} from '../reducer';
import {catchTerminalAddress} from './ActionCard/ActionCard_TerminalUtils';

export function CustomHook() {
  const dispatch = useDispatch();
  const customCards = useSelector(selectCustomCards);
  const saveCards = useSelector(selectSaveCards);
  const urlCatchingSession = useSelector(selectUrlCatchingSession);
  const runningCards = useCardsState('runningCard');
  const tabs = useTabsState('tabs');
  const runningExecutions = useSelector(selectRunningExecutions);

  // Save cards to storage
  useEffect(() => {
    if (saveCards) {
      window.electron.ipcRenderer.send(customActionsChannels.setCards, customCards);
      dispatch(reducerActions.clearSaveCards());
    }
  }, [saveCards, customCards]);

  // Load cards from storage and system paths on mount
  useEffect(() => {
    window.electron.ipcRenderer.invoke(customActionsChannels.getCards).then((cards: unknown) => {
      dispatch(reducerActions.updateState({key: 'customCards', value: sanitizeCards(cards)}));
    });
    window.electron.ipcRenderer.invoke(customActionsChannels.getSystemPaths).then(paths => {
      if (paths) {
        dispatch(reducerActions.setSystemPaths(paths));
      }
    });
  }, [dispatch]);

  // Listen for terminal data when URL catching session is active
  useEffect(() => {
    if (!urlCatchingSession || urlCatchingSession.urlFound) return;

    const {ptyId, tabId, findLine} = urlCatchingSession;

    const offData = ptyIpc.onData((dataID, data) => {
      if (dataID !== ptyId || urlCatchingSession.urlFound) return;

      const url = catchTerminalAddress(data, findLine);
      if (url && !isEmpty(url)) {
        dispatch(reducerActions.setUrlFound());
        dispatch(cardsActions.setRunningCardAddress({address: url, tabId}));
        dispatch(cardsActions.setRunningCardView({view: 'browser', tabId}));
        // Stop catching after URL is found
        setTimeout(() => dispatch(reducerActions.stopUrlCatching()), 100);
      }
    });

    return () => offData();
  }, [urlCatchingSession, dispatch]);

  // Listen for PTY process exits to clear running status and restore tab title
  useEffect(() => {
    const offExit = ptyIpc.onExit(exitId => {
      const match = (runningExecutions || []).find(item => item.ptyId === exitId);
      if (match) {
        browserIpc.send.removeBrowser(exitId);
        dispatch(cardsActions.stopRunningCard({tabId: match.tabId}));

        const targetTab = tabs.find(t => t.id === match.tabId);
        const restoredTitle =
          (targetTab && PageTitleByPageId[targetTab.pageID as keyof typeof PageTitleByPageId]) || 'Home';
        dispatch(tabsActions.setTabTitle({tabID: match.tabId, title: restoredTitle}));
        dispatch(tabsActions.setTabIsTerminal({tabID: match.tabId, isTerminal: false}));
        dispatch(tabsActions.setTabFavIcon({tabID: match.tabId, show: false, url: ''}));
        dispatch(tabsActions.setTabProgress({tabID: match.tabId, progress: undefined}));
        dispatch(reducerActions.removeRunningExecution({ptyId: exitId}));
      } else {
        dispatch(reducerActions.removeRunningExecution({ptyId: exitId}));
      }
    });

    return () => offExit();
  }, [runningExecutions, tabs, dispatch]);

  // Reconcile custom card executions with LynxHub active running cards
  useEffect(() => {
    if (!runningExecutions || runningExecutions.length === 0) return;

    const activeTabIds = new Set(runningCards.map(rc => rc.tabId));
    const activePtyIds = new Set(runningCards.map(rc => rc.id));

    runningExecutions.forEach(exec => {
      if (!activeTabIds.has(exec.tabId) && !activePtyIds.has(exec.ptyId)) {
        const targetTab = tabs.find(t => t.id === exec.tabId);
        if (targetTab) {
          const restoredTitle = PageTitleByPageId[targetTab.pageID as keyof typeof PageTitleByPageId] || 'Home';
          if (targetTab.title !== restoredTitle) {
            dispatch(tabsActions.setTabTitle({tabID: exec.tabId, title: restoredTitle}));
          }
          if (targetTab.isTerminal) {
            dispatch(tabsActions.setTabIsTerminal({tabID: exec.tabId, isTerminal: false}));
          }
        }
        dispatch(reducerActions.removeRunningExecution({cardId: exec.cardId, tabId: exec.tabId}));
      }
    });
  }, [runningCards, runningExecutions, tabs, dispatch]);

  return <Fragment />;
}
