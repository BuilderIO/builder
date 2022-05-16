import { useEffect, useCallback, useState } from 'react';

export const useContextMenu = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [menu, showMenu] = useState(false);
  const [enabled, enableContextMenu] = useState(false);
  const [ctrlDown, setCtrlDown] = useState(false);

  const handleContextMenu = useCallback(
    event => {
      if (!enabled || !ctrlDown) {
        return;
      }
      event.preventDefault();
      setX(event.clientX);
      setY(event.clientY);
      showMenu(true);
    },
    [showMenu, setX, setY, enabled, ctrlDown]
  );

  const handleClick = useCallback(() => {
    showMenu(false);
  }, [showMenu]);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      setCtrlDown(event.ctrlKey);
    },
    [setCtrlDown]
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  return { x, y, menu, enableContextMenu };
};
