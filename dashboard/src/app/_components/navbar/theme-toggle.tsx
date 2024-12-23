'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeState } from '@/lib/actions/theme.actions';
import ThemeSelector from './theme-selector';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
	themeState: ThemeState;
}
export function ThemeToggle({ themeState }: ThemeToggleProps) {
	const { setTheme } = useTheme();
	console.log('Theme State in theme', themeState);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10">
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle Theme</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				avoidCollisions={true}
				collisionPadding={2}
				sideOffset={8}>
				{Object.entries(themeState.themeList).map(([key, theme]) => (
					<ThemeSelector
						key={key}
						category={theme.label}
						theme={theme}
						themeSetter={setTheme}
					/>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
