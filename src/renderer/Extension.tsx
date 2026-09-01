import './index.css';

import {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';
import {SENTRY_DSN} from '@lynx_extension/common/consts';

import {
  AllActions,
  AudioActions,
  ImageActions,
  PinnedActions,
  RecentlyActions,
  TextActions,
  ToolsPageCard,
} from './components/cards';
import {useCustomActionsLifecycle} from './hooks';
import {setToast} from './services';
import {customActionsReducer} from './store';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.initBrowserSentry(SENTRY_DSN);

  lynxAPI.addReducer([{name: 'customActions', reducer: customActionsReducer}]);
  if (lynxAPI.toast) setToast(lynxAPI.toast);

  lynxAPI.cards.registerToolsCard?.({
    id: 'custom-actions',
    title: 'Custom Actions',
    description:
      'Create, customize, and manage custom shortcut cards with your own scripts, ' +
      'APIs, or shell commands to automate your daily developer workflows.',
    component: ToolsPageCard,
    where: 'tools_page',
  });

  if (!lynxAPI.cards.registerToolsCard) {
    lynxAPI.customizePages.tools.add.cardsContainer(ToolsPageCard);
  }

  lynxAPI.customizePages.home.add.pinCategory(PinnedActions);
  lynxAPI.customizePages.home.add.recentlyCategory(RecentlyActions);
  lynxAPI.customizePages.home.add.allCategory(AllActions);
  lynxAPI.customizePages.image.add.cardsContainer(ImageActions);
  lynxAPI.customizePages.text.add.cardsContainer(TextActions);
  lynxAPI.customizePages.audio.add.cardsContainer(AudioActions);

  lynxAPI.addCustomHook(useCustomActionsLifecycle);
}
