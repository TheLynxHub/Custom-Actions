import {useOverlayState} from '@heroui/react';
import {ToolsCard} from '@lynx/components/ToolsCard';
import {Widget6Icon} from '@solar-icons/react/bold-duotone';

import CustomActionsModal from './Modal/CustomActionsModal';

export function CustomActionsCard() {
  const state = useOverlayState();

  return (
    <>
      <ToolsCard
        description={
          'Create, customize, and manage custom shortcut cards with your own scripts, ' +
          'APIs, or shell commands to automate your daily developer workflows.'
        }
        id="custom-actions"
        onPress={state.open}
        title="Custom Actions"
        icon={<Widget6Icon className="size-8 text-cyan-500" />}
      />
      <CustomActionsModal state={state} />
    </>
  );
}

export default CustomActionsCard;
