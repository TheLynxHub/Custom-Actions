import {Button} from '@heroui/react';
import filesIpc from '@lynx_shared/ipc/files';
import {PlayCircleIcon} from '@solar-icons/react/bold';
import {useState} from 'react';
import {useDispatch} from 'react-redux';

import {reducerActions} from '../../../reducer';

export function AddExe() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAdd = () => {
    setIsLoading(true);
    filesIpc.openDlg({properties: ['openFile']}).then(action => {
      if (action) dispatch(reducerActions.addAction({action, type: 'exe'}));
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
      <PlayCircleIcon className="size-4 text-amber-400" />
      Choose Program (.exe)
    </Button>
  );
}
