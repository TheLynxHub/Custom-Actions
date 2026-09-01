import {Button} from '@heroui/react';
import {reducerActions, selectEditingCard} from '@lynx_extension/renderer/store';
import filesIpc from '@lynx_shared/ipc/files';
import {Code2Icon} from '@solar-icons/react/bold-duotone';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

export function AddScriptButton() {
  const dispatch = useDispatch();
  const editingCard = useSelector(selectEditingCard);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAdd = () => {
    setIsLoading(true);
    filesIpc.openDlg({properties: ['openFile']}).then(action => {
      if (action) {
        const lastSeparator = Math.max(action.lastIndexOf('/'), action.lastIndexOf('\\'));
        const directory = lastSeparator > 0 ? action.substring(0, lastSeparator) : undefined;

        if (!editingCard?.cwd && directory) {
          dispatch(reducerActions.setCwd(directory));
        }

        dispatch(reducerActions.addAction({action, type: 'script', cwd: directory}));
      }
      setIsLoading(false);
    });
  };

  return (
    <Button
      size="sm"
      onPress={handleAdd}
      variant="secondary"
      isPending={isLoading}
      className="bg-surface shadow-surface hover:bg-surface/50">
      <Code2Icon className="size-4 text-accent" />
      Run Script File
    </Button>
  );
}

export default AddScriptButton;
