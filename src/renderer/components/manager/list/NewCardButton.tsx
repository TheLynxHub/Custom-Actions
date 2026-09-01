import {reducerActions} from '@lynx_extension/renderer/store';
import {Plus} from 'lucide-react';
import {useDispatch} from 'react-redux';

export function NewCardButton() {
  const dispatch = useDispatch();

  const handleCreateNew = () => dispatch(reducerActions.addCard());

  return (
    <button
      className={
        'group relative flex flex-col items-center justify-center text-center p-3.5 rounded-3xl ' +
        'border-2 border-dashed border-border/70 hover:border-accent/60 bg-surface-secondary/30 ' +
        'hover:bg-accent/5 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 ' +
        'cursor-pointer min-h-42 w-full select-none'
      }
      type="button"
      onClick={handleCreateNew}>
      <div
        className={
          'flex size-10 items-center justify-center rounded-full bg-surface-tertiary/80 text-muted ' +
          'group-hover:bg-accent/20 group-hover:text-accent group-hover:scale-105 border border-border/50 ' +
          'group-hover:border-accent/30 transition-all duration-200 mb-2.5 shadow-2xs'
        }>
        <Plus className="size-5" />
      </div>
      <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">Create New Action</p>
      <p className="text-[11px] text-muted mt-0.5">Add custom script or shortcut</p>
    </button>
  );
}

export default NewCardButton;
