import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import type { Input } from '@builder.io/sdk';
import {
  ControlledMenu,
  FocusableItem,
  MenuHeader,
  MenuItem,
  MenuRadioGroup,
  SubMenu,
  useMenuState,
} from '@szhsin/react-menu';

import { useContextMenu } from './use-context-menu';

export interface TargetingAttributes {
  [key: string]: Input;
}

export interface ContextMenuProps {
  targetingAttributes?: TargetingAttributes;
  attributesApiPath?: string;
  cookiesPrefix?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  targetingAttributes,
  attributesApiPath,
  cookiesPrefix = 'builder.userAttributes',
}) => {
  const { x, y, menu, enableContextMenu } = useContextMenu();
  const [loading, setLoading] = useState(false);

  const [attributes, setAttributes] = useState(targetingAttributes);
  useEffect(() => {
    async function init() {
      if (attributes) {
        enableContextMenu(true);
      } else {
        setLoading(true);
        try {
          const response = await fetch(attributesApiPath || '/api/attributes').then(res =>
            res.json()
          );
          setAttributes(response);
          enableContextMenu(true);
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
      }
    }
    init();
  }, []);
  const setCookie = (name: string, val: string) => () => {
    Cookies.set(`${cookiesPrefix}.${name}`, val);
    location.reload();
  };

  const reset = () => {
    Object.keys(Cookies.get())
      .filter(key => key.startsWith(cookiesPrefix))
      .forEach(cookie => Cookies.remove(cookie));
    location.reload();
  };

  const { toggleMenu, ...menuProps } = useMenuState();

  useEffect(() => {
    if (menu && attributes) {
      toggleMenu(true);
    }
  }, [menu]);

  const keys = Object.keys(attributes || {});

  return (
    <ControlledMenu {...menuProps} anchorPoint={{ x, y }} onClose={() => toggleMenu(false)}>
      <MenuHeader>Personalization settings</MenuHeader>
      <MenuItem onClick={reset}>Reset</MenuItem>

      {keys.sort().map((attr, index) => {
        const options = attributes![attr].enum as string[];
        return (
          <SubMenu key={index} label={`${attr} settings`}>
            {options ? (
              <MenuRadioGroup value={Cookies.get(`${cookiesPrefix}.${attr}`)}>
                {options.map(option => (
                  <MenuItem key={option} value={option} onClick={setCookie(attr, String(option))}>
                    {option}
                  </MenuItem>
                ))}
              </MenuRadioGroup>
            ) : (
              <FocusableItem>
                {({ ref }) => (
                  <form
                    onSubmit={e => {
                      const data = new FormData(e.currentTarget);
                      const values = Object.fromEntries(data.entries());
                      e.preventDefault();
                      setCookie(attr, values[attr] as string)();
                    }}
                  >
                    <input
                      ref={ref}
                      name={attr}
                      type="text"
                      defaultValue={Cookies.get(`${cookiesPrefix}.${attr}`)}
                    />
                  </form>
                )}
              </FocusableItem>
            )}
          </SubMenu>
        );
      })}
      {loading && 'Loading..'}
    </ControlledMenu>
  );
};
