import {Plus} from 'lucide-react';
import {useDispatch} from 'react-redux';

import {reducerActions} from '../../../reducer';

export function NewCard() {
  const dispatch = useDispatch();

  const handleCreateNew = () => dispatch(reducerActions.addCard());

  return (
    <button
      className={
        'group relative flex flex-col items-center justify-center text-center p-4 rounded-3xl ' +
        'border-2 border-dashed border-border/70 hover:border-accent/60 bg-surface ' +
        'hover:bg-accent/5 transition-all duration-200 cursor-pointer min-h-40 w-full'
      }
      type="button"
      onClick={handleCreateNew}>
      <div
        className={
          'flex size-10 items-center justify-center rounded-full bg-surface-tertiary text-muted ' +
          'group-hover:bg-accent/20 group-hover:text-accent transition-all duration-200 mb-2 ' +
          'shadow-2xs group-hover:scale-110'
        }>
        <Plus className="size-5" />
      </div>
      <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">Create New Action</p>
      <p className="text-[11px] text-muted mt-0.5">Add custom script or shortcut</p>
    </button>
  );
}
