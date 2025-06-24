'use client';

// ** React Imports
import React from 'react';

// ** Component Imports
import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
} from '@/components/ui/menubar';

// ** Icon Imports
import { Icon } from '@iconify/react';

// ** Context Imports
import { useTheme } from '@/context/ThemeProvider';

// ** Constants
import { themes } from '@/constants';

interface ThemeType {
  value: string;
  label: string;
  icon: string;
}

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme();

  const handleThemeChange = (theme: ThemeType) => {
    setMode(theme.value);

    if (theme.value !== 'system') {
      localStorage.theme = theme.value;
    } else {
      localStorage.removeItem('theme');
    }
  };

  return (
    <Menubar className="relative border-none bg-transparent shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="focus:bg-light-900 data-[state=open]:bg-light-900 dark:focus:bg-dark-200 dark:data-[state=open]:bg-dark-200">
          {mode === 'dark' ? (
            <Icon
              width={24}
              height={24}
              icon="material-symbols:dark-mode"
              className="cursor-pointer text-primary"
            />
          ) : (
            <Icon
              width={24}
              height={24}
              icon="material-symbols:light-mode"
              className="cursor-pointer text-primary"
            />
          )}
        </MenubarTrigger>
        <MenubarContent className="mt-2 bg-[#F9F9F9] dark:bg-[#181818] shadow-lg rounded-md py-2 w-60">
          {themes.map((theme, index) => (
            <MenubarItem
              key={index}
              onSelect={() => handleThemeChange(theme)}
              className="focus:bg-light-800 dark:focus:bg-dark-400 flex cursor-pointer items-center gap-4 rounded px-2.5 py-2 hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
            >
              <Icon
                width={24}
                height={24}
                icon={theme.icon}
                className={`${
                  mode === theme.value && 'text-primary dark:text-primary'
                }`}
              />
              <p
                className={`body-semibold text-light-500 ${
                  mode === theme.value
                    ? 'text-primary dark:text-primary'
                    : 'text-black dark:text-white'
                }`}
              >
                {theme.label}
              </p>
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default ThemeSwitcher;
