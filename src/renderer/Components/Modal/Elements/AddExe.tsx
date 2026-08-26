import {Button} from '@heroui/react';
import filesIpc from '@lynx_shared/ipc/files';
import {PlayIcon} from '@solar-icons/react/bold';
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
    <Button onPress={handleAdd} isPending={isLoading} fullWidth>
      <PlayIcon />
      Add Executable
    </Button>
  );
}
