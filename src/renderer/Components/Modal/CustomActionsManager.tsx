import {Button, InputGroup, Separator} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import {PinIcon} from '@solar-icons/react/bold';
import {
  Code2Icon,
  EarthIcon,
  FolderOpenIcon,
  LayersIcon,
  MagnifierIcon,
  Widget6Icon,
} from '@solar-icons/react/bold-duotone';
import {AnimatePresence, motion} from 'framer-motion';
import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomCard, CustomCardType} from '../../../cross/CrossTypes';
import {reducerActions, selectCustomCards, selectEditingCard, selectView} from '../../reducer';
import {CardIcon} from '../CardIcons';
import {AddToCategories} from './Elements/AddToCategories';
import {BatchActionBar} from './Elements/BatchActionBar';
import {CardDetails} from './Elements/CardDetails';
import {CardType} from './Elements/CardType';
import {EnvConfig} from './Elements/EnvConfig';
import {ExecuteActions} from './Elements/ExecuteActions';
import FormSection from './Elements/FormSection';
import {NewCard} from './Elements/NewCard';
import {PreviewCard} from './Elements/PreviewCard';
import {UrlConfig} from './Elements/UrlConfig';
import {WorkingDirectory} from './Elements/WorkingDirectory';

type Props = {
  selectedCardIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onClearSelect?: () => void;
};

type FilterCategory = 'all' | 'pinned' | CustomCardType;

export default function CustomActionsManager({
  selectedCardIds = [],
  onToggleSelect,
  onSelectAll,
  onClearSelect,
}: Props) {
  const dispatch = useDispatch();

  const cards = useSelector(selectCustomCards);
  const editingCard = useSelector(selectEditingCard);
  const view = useSelector(selectView);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const handleEdit = (card: CustomCard) => {
    dispatch(reducerActions.setEditingCard(card));
    dispatch(reducerActions.setView('form'));
  };

  const handleCreateNew = () => {
    dispatch(reducerActions.addCard());
  };

  const cardType = useMemo(() => editingCard?.cardType || 'terminal_browser', [editingCard]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Category filter
      if (activeFilter === 'pinned' && !card.categories?.pinned) return false;
      if (activeFilter !== 'all' && activeFilter !== 'pinned' && card.cardType !== activeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(q);
        const matchesDesc = (card.description || '').toLowerCase().includes(q);
        const matchesUrl = (card.urlConfig?.customUrl || '').toLowerCase().includes(q);
        const matchesAction = (card.actions || []).some(a => a.action.toLowerCase().includes(q));
        const matchesCwd = (card.cwd || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesUrl || matchesAction || matchesCwd;
      }

      return true;
    });
  }, [cards, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: cards.length,
      pinned: cards.filter(c => c.categories?.pinned).length,
      terminal_browser: cards.filter(c => c.cardType === 'terminal_browser').length,
      terminal: cards.filter(c => c.cardType === 'terminal').length,
      browser: cards.filter(c => c.cardType === 'browser').length,
      executable: cards.filter(c => c.cardType === 'executable').length,
    };
  }, [cards]);

  return (
    <div className="size-full py-2">
      {view === 'list' ? (
        <div className="flex flex-col gap-y-4">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-row items-center justify-between gap-3 p-1">
            <InputGroup variant="secondary" className="w-full max-w-xs">
              <InputGroup.Prefix className="text-muted">
                <MagnifierIcon className="size-4" />
              </InputGroup.Prefix>
              <InputGroup.Input
                value={searchQuery}
                className="text-xs"
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search actions, commands, URLs..."
              />
            </InputGroup>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0 scrollbar-hide">
              <button
                className={
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'all'
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('all')}>
                All
                <span className="text-[10px] opacity-75 ">({counts.all})</span>
              </button>

              <button
                className={
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'pinned'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('pinned')}>
                <PinIcon className="size-3" />
                Pinned
                <span className="text-[10px] opacity-75 ">({counts.pinned})</span>
              </button>

              <button
                className={
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'terminal_browser'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('terminal_browser')}>
                Both
                <span className="text-[10px] opacity-75">({counts.terminal_browser})</span>
              </button>

              <button
                className={
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'terminal'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('terminal')}>
                Terminal
                <span className="text-[10px] opacity-75 ">({counts.terminal})</span>
              </button>

              <button
                className={
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'browser'
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('browser')}>
                Browser
                <span className="text-[10px] opacity-75 ">({counts.browser})</span>
              </button>

              <button
                className={
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ' +
                  'transition-all cursor-pointer ' +
                  (activeFilter === 'executable'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary')
                }
                type="button"
                onClick={() => setActiveFilter('executable')}>
                EXE
                <span className="text-[10px] opacity-75 ">({counts.executable})</span>
              </button>
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {cards.length === 0 ? (
            <div
              className={
                'flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed ' +
                'border-border/60 bg-surface/30 text-center my-6'
              }>
              <div
                className={
                  'size-14 rounded-2xl bg-accent/15 flex items-center justify-center ' +
                  'text-accent mb-4 ring-1 ring-accent/30'
                }>
                <Widget6Icon className="size-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">No Custom Action Shortcuts Yet</h3>
              <p className="text-xs text-muted max-w-md mt-1 mb-6 leading-relaxed">
                Automate your daily developer workflows by building custom shortcut cards with shell scripts, local web
                ports, background tools, or executables.
              </p>
              <Button size="md" onPress={handleCreateNew}>
                <Code2Icon className="size-4" />
                Create Your First Action
              </Button>
            </div>
          ) : filteredCards.length === 0 ? (
            <div
              className={
                'flex flex-col items-center justify-center p-10 rounded-3xl border border-dashed ' +
                'border-border bg-surface shadow-surface text-center my-6'
              }>
              <MagnifierIcon className="size-8 text-muted/50 mb-3" />
              <h3 className="text-sm font-bold text-foreground">No Matching Actions</h3>
              <p className="text-xs text-muted max-w-sm mt-1 mb-4">
                No custom cards match your current search query &quot;{searchQuery}&quot; or filter.
              </p>
              <Button
                onPress={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                size="sm"
                variant="tertiary">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3.5">
              <NewCard />
              {filteredCards.map(card => {
                return (
                  <PreviewCard
                    card={card}
                    key={card.id}
                    handleEdit={handleEdit}
                    isSelected={selectedCardIds?.includes(card.id)}
                    icon={<CardIcon id={card.icon} className="size-full" />}
                    onSelect={onToggleSelect ? () => onToggleSelect(card.id) : undefined}
                  />
                );
              })}
            </div>
          )}

          {/* Floating Batch Action Bar */}
          <AnimatePresence>
            {selectedCardIds && selectedCardIds.length > 0 && (
              <BatchActionBar
                selectedCardIds={selectedCardIds}
                totalVisibleCount={filteredCards.length}
                onClearSelection={() => onClearSelect?.()}
                onSelectAllVisible={() => onSelectAll?.(filteredCards.map(c => c.id))}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Form View */
        <motion.div
          exit={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.2}}
          initial={{opacity: 0, y: 10}}
          className="space-y-4 pb-4 pr-1">
          <FormSection title="General Information" icon={<Widget6Icon className="size-4" />}>
            <CardDetails />
          </FormSection>

          <Separator />

          <FormSection title="Working Directory" icon={<FolderOpenIcon className="size-4" />}>
            <WorkingDirectory />
          </FormSection>

          <Separator />

          <FormSection title="Execution Type" icon={<LayersIcon className="size-4" />}>
            <CardType />
          </FormSection>

          <Separator />

          <FormSection title="Commands & Actions" icon={<Code2Icon className="size-4" />}>
            <ExecuteActions />
          </FormSection>

          <Separator />

          <AnimatePresence>
            {cardType !== 'terminal' && (
              <>
                <FormSection title="Browser & Web Tab" icon={<EarthIcon className="size-4" />}>
                  <UrlConfig />
                </FormSection>
                <Separator />
              </>
            )}
          </AnimatePresence>

          {cardType !== 'browser' && (
            <>
              <FormSection title="Environment Variables" icon={<Terminal_Icon className="size-4" />}>
                <EnvConfig />
              </FormSection>
              <Separator />
            </>
          )}

          <FormSection title="Categories & Placement" icon={<FolderOpenIcon className="size-4" />}>
            <AddToCategories />
          </FormSection>
        </motion.div>
      )}
    </div>
  );
}
