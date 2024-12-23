'use client';
import {
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { updateTheme } from '@/lib/actions/theme.actions';
import { Theme } from '@/types/config.s.t';

interface ThemeSelectorProps {
	category: string;
	theme: Theme;
	themeSetter: (theme: string) => void;
}

export default function ThemeSelector({
	category,
	theme,
	themeSetter,
}: ThemeSelectorProps) {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>{category}</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				{theme.opts.map(
					(
						theme: { identifier: string; label: string },
						_index: number
					) => (
						<DropdownMenuItem
							key={theme.identifier}
							onClick={async () => {
								await updateTheme(theme.identifier);
								themeSetter(theme.identifier);
							}}
							className="text-center justify-center">
							{theme.label}
						</DropdownMenuItem>
					)
				)}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
