import {Checkbox, CheckboxGroup} from '@heroui/react';
import {PinIcon, StarIcon} from '@solar-icons/react/bold';
import {DocumentTextIcon, GalleryIcon, MusicNotesIcon, Widget6Icon} from '@solar-icons/react/bold-duotone';
import {ReactNode, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CustomCategories, CustomCategory} from '../../../../cross/CrossTypes';
import {reducerActions, selectEditingCard} from '../../../reducer';

type CategoryItem = {
  id: CustomCategory;
  name: string;
  desc: string;
  icon: ReactNode;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: 'pinned',
    name: 'Pinned',
    desc: 'Top of home workspace',
    icon: <PinIcon className="size-4 text-amber-400" />,
  },
  {
    id: 'recentlyUsed',
    name: 'Recently Used',
    desc: 'Quick access history',
    icon: <StarIcon className="size-4 text-accent" />,
  },
  {
    id: 'all',
    name: 'All Categories',
    desc: 'Included in global list',
    icon: <Widget6Icon className="size-4 text-purple-400" />,
  },
  {
    id: 'image',
    name: 'Image Gen',
    desc: 'Image tools page',
    icon: <GalleryIcon className="size-4 text-cyan-400" />,
  },
  {
    id: 'text',
    name: 'Text Gen',
    desc: 'Text & LLM tools page',
    icon: <DocumentTextIcon className="size-4 text-emerald-400" />,
  },
  {
    id: 'audio',
    name: 'Audio Gen',
    desc: 'Audio & speech tools page',
    icon: <MusicNotesIcon className="size-4 text-pink-400" />,
  },
];

export function AddToCategories() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);
  const categories = useMemo(() => editingCard?.categories, [editingCard]);

  const selectedValues = useMemo(() => {
    if (!categories) return [];
    return (Object.keys(categories) as CustomCategory[]).filter(key => Boolean(categories[key]));
  }, [categories]);

  const handleGroupChange = (newValues: string[]) => {
    const updatedCategories: CustomCategories = {};
    CATEGORIES.forEach(cat => {
      if (newValues.includes(cat.id)) {
        updatedCategories[cat.id] = true;
      }
    });
    dispatch(reducerActions.setAllCategories(updatedCategories));
  };

  return (
    <CheckboxGroup
      value={selectedValues}
      onChange={handleGroupChange}
      className="grid grid-cols-3 gap-2"
      aria-label="Categories & Placement">
      {CATEGORIES.map(cat => {
        return (
          <Checkbox key={cat.id} value={cat.id} aria-label={cat.name} className="w-full mt-0!">
            {({isSelected: checked}) => (
              <Checkbox.Content
                className={
                  'group flex items-center justify-between p-2.5 rounded-3xl border text-left ' +
                  'transition-all duration-150 cursor-pointer w-full ' +
                  (checked
                    ? 'border-accent bg-accent/15 ring-1 ring-accent/30 shadow-xs'
                    : 'border-border/50 bg-surface/50 hover:bg-surface-hover hover:border-border')
                }>
                <div className="flex items-center gap-x-2.5 min-w-0">
                  <div
                    className={`flex size-7 items-center justify-center rounded-full shrink-0 ${
                      checked ? 'bg-accent/20' : 'bg-surface-tertiary/70'
                    }`}>
                    {cat.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{cat.name}</span>
                    <span className="text-[10px] text-muted truncate">{cat.desc}</span>
                  </div>
                </div>

                <div className="shrink-0 ml-1.5">
                  <Checkbox.Control className="rounded-full before:rounded-full">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </div>
              </Checkbox.Content>
            )}
          </Checkbox>
        );
      })}
    </CheckboxGroup>
  );
}
