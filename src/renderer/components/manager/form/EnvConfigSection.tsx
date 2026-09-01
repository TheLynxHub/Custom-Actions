import {Button, Input} from '@heroui/react';
import {reducerActions, selectEditingCard} from '@lynx_extension/renderer/store';
import {TrashBin2Icon} from '@solar-icons/react/bold-duotone';
import {Plus} from 'lucide-react';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

export function EnvConfigSection() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);

  const env = editingCard?.env || [];

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      dispatch(reducerActions.addEnv({key: newKey.trim(), value: newValue}));
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (index: number) => {
    dispatch(reducerActions.removeEnv(index));
  };

  const handleUpdate = (index: number, key: string, value: string) => {
    dispatch(reducerActions.updateEnv({index, key, value}));
  };

  return (
    <div className="flex flex-col gap-y-3">
      {env.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {env.map((item, index) => (
            <div key={index} className="flex items-center gap-x-2 w-full">
              <Input
                value={item.key}
                placeholder="KEY"
                className="w-1/3 font-JetBrainsMono text-xs"
                onChange={e => handleUpdate(index, e.target.value, item.value)}
              />
              <span className="text-muted text-xs font-mono font-bold">=</span>
              <Input
                value={item.value}
                placeholder="VALUE"
                className="flex-1 font-JetBrainsMono text-xs"
                onChange={e => handleUpdate(index, item.key, e.target.value)}
              />
              <Button
                size="sm"
                variant="danger-soft"
                aria-label="Remove variable"
                onPress={() => handleRemove(index)}
                isIconOnly>
                <TrashBin2Icon className="size-3.5 text-danger" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={'p-3 rounded-3xl border border-border border-dashed bg-surface/70 text-center text-xs text-muted'}>
          No custom environment variables added.
        </div>
      )}

      {/* Add New Variable Row */}
      <div className="flex items-center gap-x-2 w-full pt-2 border-t border-border/40">
        <Input
          value={newKey}
          placeholder="NEW_KEY (e.g. PORT)"
          onChange={e => setNewKey(e.target.value)}
          className="w-1/3 font-JetBrainsMono text-xs"
        />
        <span className="text-muted text-xs font-mono font-bold">=</span>
        <Input
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          value={newValue}
          placeholder="value (e.g. 8080)"
          onChange={e => setNewValue(e.target.value)}
          className="flex-1 font-JetBrainsMono text-xs"
        />
        <Button
          size="sm"
          variant="secondary"
          onPress={handleAdd}
          isDisabled={!newKey.trim()}
          aria-label="Add environment variable"
          className="bg-surface shadow-surface hover:bg-surface-secondary">
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default EnvConfigSection;
