import './index.css';

import {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';

import {SENTRY_DSN} from '../cross/constants';
import {
  AllActions,
  AudioActions,
  ImageActions,
  PinnedActions,
  RecentlyActions,
  TextActions,
} from './Components/CardsContainer';
import {CustomHook} from './Components/CustomHooks';
import CustomActionsCard from './Components/ToolsPage';
import reducer from './reducer';
import {setToast} from './toastHolder';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.initBrowserSentry(SENTRY_DSN);

  lynxAPI.addReducer([{name: 'customActions', reducer}]);
  if (lynxAPI.toast) setToast(lynxAPI.toast);

  lynxAPI.cards.registerToolsCard?.({
    id: 'custom-actions',
    title: 'Custom Actions',
    description:
      'Create, customize, and manage custom shortcut cards with your own scripts, ' +
      'APIs, or shell commands to automate your daily developer workflows.',
    component: CustomActionsCard,
    where: 'tools_page',
  });

  if (!lynxAPI.cards.registerToolsCard) {
    lynxAPI.customizePages.tools.add.cardsContainer(CustomActionsCard);
  }

  lynxAPI.customizePages.home.add.pinCategory(PinnedActions);
  lynxAPI.customizePages.home.add.recentlyCategory(RecentlyActions);
  lynxAPI.customizePages.home.add.allCategory(AllActions);
  lynxAPI.customizePages.image.add.cardsContainer(ImageActions);
  lynxAPI.customizePages.text.add.cardsContainer(TextActions);
  lynxAPI.customizePages.audio.add.cardsContainer(AudioActions);

  lynxAPI.addCustomHook(CustomHook);
}
