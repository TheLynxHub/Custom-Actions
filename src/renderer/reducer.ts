import {formatLocalPathToUrl, formatWebAddress} from '@lynx_common/utils';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {sanitizeCard, sanitizeCards} from '../cross/cardSanitizer';
import {
  CustomCard,
  CustomCardType,
  CustomCategories,
  CustomCategory,
  CustomEnvVar,
  CustomExecuteActions,
  CustomUrlConfigType,
} from '../cross/CrossTypes';

export type UrlCatchingSession = {
  ptyId: string;
  tabId: string;
  findLine: string;
  urlFound: boolean;
};

export type CustomActionsState = {
  customCards: CustomCard[];
  view: 'list' | 'form';
  editingCard?: CustomCard;
  saveCards?: boolean;
  urlCatchingSession?: UrlCatchingSession;
};

const initialState: CustomActionsState = {
  customCards: [],
  view: 'list',
  editingCard: undefined,
  saveCards: false,
  urlCatchingSession: undefined,
};

const customActionsSlice = createSlice({
  initialState,
  name: 'customActions',
  reducers: {
    updateState: <K extends keyof CustomActionsState>(
      state: CustomActionsState,
      action: PayloadAction<{
        key: K;
        value: CustomActionsState[K];
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },

    addCard: state => {
      state.editingCard = {
        id: crypto.randomUUID(),
        title: '',
        icon: 'bot',
        cardType: 'terminal_browser',
        urlConfig: {type: 'nothing', openImmediately: true, timeout: 5},
        categories: {pinned: true},
        actions: [],
        env: [],
      };
      state.view = 'form';
    },
    removeCard: state => {
      state.customCards = state.customCards.filter(item => item.id !== state.editingCard?.id);
      state.editingCard = undefined;
      state.view = 'list';
      state.saveCards = true;
    },
    saveCard: state => {
      const targetCard = state.editingCard!;

      let targetUrl = targetCard.urlConfig.customUrl;
      if (targetUrl) {
        if (targetCard.urlConfig.type === 'htmlFile') {
          targetUrl = formatLocalPathToUrl(targetUrl);
        } else {
          targetUrl = formatWebAddress(targetUrl);
        }
        targetCard.urlConfig.customUrl = targetUrl;
      }

      if (state.customCards.some(card => card.id === targetCard.id)) {
        state.customCards = state.customCards.map(card => (card.id === targetCard.id ? targetCard : card));
      } else {
        state.customCards = [...state.customCards, targetCard!];
      }

      state.view = 'list';
      state.editingCard = undefined;
      state.saveCards = true;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      if (state.editingCard) {
        state.editingCard.title = action.payload;
      }
    },
    setCardType: (state, action: PayloadAction<CustomCardType>) => {
      if (state.editingCard) state.editingCard.cardType = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      if (state.editingCard) state.editingCard.description = action.payload;
    },
    setIcon: (state, action: PayloadAction<string>) => {
      if (state.editingCard) state.editingCard.icon = action.payload;
    },

    setView: (state, action: PayloadAction<'list' | 'form'>) => {
      state.view = action.payload;
    },
    setEditingCard: (state, action: PayloadAction<CustomCard | undefined>) => {
      if (action.payload) {
        const sanitized = sanitizeCard(action.payload);
        state.editingCard = sanitized ?? undefined;
      } else {
        state.editingCard = undefined;
      }
    },
    setUrlConfigType: (state, action: PayloadAction<CustomUrlConfigType>) => {
      if (state.editingCard) state.editingCard.urlConfig.type = action.payload;
    },
    setCustomUrl: (state, action: PayloadAction<string>) => {
      if (state.editingCard) state.editingCard.urlConfig.customUrl = action.payload;
    },
    setOpenImmediately: (state, action: PayloadAction<boolean>) => {
      if (state.editingCard) state.editingCard.urlConfig.openImmediately = action.payload;
    },
    setTimeoutValue: (state, action: PayloadAction<number>) => {
      if (state.editingCard) state.editingCard.urlConfig.timeout = action.payload;
    },
    setFindLine: (state, action: PayloadAction<string>) => {
      if (state.editingCard) state.editingCard.urlConfig.findLine = action.payload;
    },
    setCategories: (state, action: PayloadAction<{id: CustomCategory; value: boolean}>) => {
      if (state.editingCard) {
        if (!state.editingCard.categories) {
          state.editingCard.categories = {};
        }
        state.editingCard.categories[action.payload.id] = action.payload.value;
      }
    },
    setAllCategories: (state, action: PayloadAction<CustomCategories>) => {
      if (state.editingCard) {
        state.editingCard.categories = action.payload;
      }
    },
    setActions: (state, action: PayloadAction<CustomExecuteActions[]>) => {
      if (state.editingCard) {
        state.editingCard.actions = action.payload;
      }
    },
    removeAction: (state, action: PayloadAction<number>) => {
      if (state.editingCard) {
        state.editingCard.actions = state.editingCard.actions.filter((_, index) => index !== action.payload);
      }
    },
    addAction: (state, action: PayloadAction<CustomExecuteActions>) => {
      if (state.editingCard) {
        const item: CustomExecuteActions = {
          id: action.payload.id || crypto.randomUUID(),
          ...action.payload,
        };
        state.editingCard.actions = [...state.editingCard.actions, item];
      }
    },
    duplicateAction: (state, action: PayloadAction<number>) => {
      if (state.editingCard && state.editingCard.actions[action.payload]) {
        const source = state.editingCard.actions[action.payload];
        const newItem: CustomExecuteActions = {
          ...source,
          id: crypto.randomUUID(),
        };
        state.editingCard.actions.splice(action.payload + 1, 0, newItem);
      }
    },
    toggleActionDisabled: (state, action: PayloadAction<number>) => {
      if (state.editingCard && state.editingCard.actions[action.payload]) {
        const current = state.editingCard.actions[action.payload].disabled;
        state.editingCard.actions[action.payload].disabled = !current;
      }
    },
    updateAction: (state, action: PayloadAction<{index: number; newAction: string}>) => {
      if (state.editingCard && state.editingCard.actions[action.payload.index]) {
        state.editingCard.actions[action.payload.index].action = action.payload.newAction;
      }
    },
    setEnv: (state, action: PayloadAction<CustomEnvVar[]>) => {
      if (state.editingCard) state.editingCard.env = action.payload;
    },
    addEnv: (state, action: PayloadAction<CustomEnvVar>) => {
      if (state.editingCard) {
        state.editingCard.env = [...(state.editingCard.env || []), action.payload];
      }
    },
    removeEnv: (state, action: PayloadAction<number>) => {
      if (state.editingCard && state.editingCard.env) {
        state.editingCard.env = state.editingCard.env.filter((_, index) => index !== action.payload);
      }
    },
    updateEnv: (state, action: PayloadAction<{index: number; key: string; value: string}>) => {
      if (state.editingCard && state.editingCard.env && state.editingCard.env[action.payload.index]) {
        state.editingCard.env[action.payload.index] = {
          key: action.payload.key,
          value: action.payload.value,
        };
      }
    },
    clearSaveCards: state => {
      state.saveCards = false;
    },
    startUrlCatching: (state, action: PayloadAction<{ptyId: string; tabId: string; findLine: string}>) => {
      state.urlCatchingSession = {
        ptyId: action.payload.ptyId,
        tabId: action.payload.tabId,
        findLine: action.payload.findLine,
        urlFound: false,
      };
    },
    stopUrlCatching: state => {
      state.urlCatchingSession = undefined;
    },
    setUrlFound: state => {
      if (state.urlCatchingSession) {
        state.urlCatchingSession.urlFound = true;
      }
    },
    importCards: (state, action: PayloadAction<CustomCard[] | unknown>) => {
      const sanitized = sanitizeCards(action.payload);
      if (sanitized.length === 0) return;

      const existingIds = new Set(state.customCards.map(c => c.id));
      const newCards = sanitized.map(card => {
        let newId = card.id || crypto.randomUUID();
        let newTitle = card.title;
        let counter = 1;
        while (existingIds.has(newId)) {
          newId = crypto.randomUUID();
          newTitle = `${card.title} (Imported ${counter})`;
          counter++;
        }
        existingIds.add(newId);
        const actions = (card.actions || []).map(a => ({
          ...a,
          id: a.id || crypto.randomUUID(),
        }));
        return {...card, id: newId, title: newTitle, actions};
      });
      state.customCards = [...state.customCards, ...newCards];
      state.saveCards = true;
    },
    batchDeleteCards: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      state.customCards = state.customCards.filter(card => !idsToDelete.has(card.id));
      if (state.editingCard && idsToDelete.has(state.editingCard.id)) {
        state.editingCard = undefined;
        state.view = 'list';
      }
      state.saveCards = true;
    },
    batchDuplicateCards: (state, action: PayloadAction<string[]>) => {
      const idsToDuplicate = new Set(action.payload);
      const duplicatedCards: CustomCard[] = [];

      for (const card of state.customCards) {
        if (idsToDuplicate.has(card.id)) {
          const newCard: CustomCard = {
            ...card,
            id: crypto.randomUUID(),
            title: `${card.title} (Copy)`,
            urlConfig: {...card.urlConfig},
            categories: {...card.categories},
            actions: (card.actions || []).map(actionItem => ({
              ...actionItem,
              id: crypto.randomUUID(),
            })),
            env: card.env ? card.env.map(e => ({...e})) : undefined,
          };
          duplicatedCards.push(newCard);
        }
      }

      if (duplicatedCards.length > 0) {
        state.customCards = [...state.customCards, ...duplicatedCards];
        state.saveCards = true;
      }
    },
    batchSetCategory: (state, action: PayloadAction<{cardIds: string[]; category: CustomCategory; value: boolean}>) => {
      const targetIds = new Set(action.payload.cardIds);
      state.customCards = state.customCards.map(card => {
        if (!targetIds.has(card.id)) return card;
        const categories = card.categories ? {...card.categories} : {};
        categories[action.payload.category] = action.payload.value;
        return {...card, categories};
      });
      state.saveCards = true;
    },
    batchToggleCategory: (state, action: PayloadAction<{cardIds: string[]; category: CustomCategory}>) => {
      const targetIds = new Set(action.payload.cardIds);
      const selectedCards = state.customCards.filter(card => targetIds.has(card.id));
      if (selectedCards.length === 0) return;

      const allEnabled = selectedCards.every(card => Boolean(card.categories?.[action.payload.category]));
      const newValue = !allEnabled;

      state.customCards = state.customCards.map(card => {
        if (!targetIds.has(card.id)) return card;
        const categories = card.categories ? {...card.categories} : {};
        categories[action.payload.category] = newValue;
        return {...card, categories};
      });
      state.saveCards = true;
    },
  },
});

export const selectCustomCards = (state: any): CustomCard[] => state.customActions.customCards;
export const selectView = (state: any): 'list' | 'form' => state.customActions.view;
export const selectEditingCard = (state: any): CustomCard | undefined => state.customActions.editingCard;
export const selectSaveCards = (state: any): boolean | undefined => state.customActions.saveCards;
export const selectUrlCatchingSession = (state: any): UrlCatchingSession | undefined =>
  state.customActions.urlCatchingSession;

export const reducerActions = customActionsSlice.actions;

export default customActionsSlice.reducer;
