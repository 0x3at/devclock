'use client';
import { Menubar } from '@/components/ui/menubar';
import { ActivityMenu } from './navbar/activity-dropdown';
import { DateRangePicker } from './navbar/date-range';
import { ThemeToggle } from './navbar/theme-toggle';
import SettingsMenu from './navbar/settings-dropdown';
import { ThemeState } from '@/lib/actions/theme.actions';

export function FloatingNavBar({ themeState }: { themeState: ThemeState }) {
	return (
		<div className="container min-w-screen-lg">
			<Menubar className="fixed text-sm top-4 left-1/2 transform -translate-x-1/2 rounded-md shadow-border py-5 bg-accent/50 backdrop-blur-sm w-[75%] min-w-screen-md z-50 transition-all hover:shadow-lg hover:-translate-y-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-4 w-[200px]">
						<ThemeToggle themeState={themeState} />
						<ActivityMenu />
					</div>
					<div className="flex-shrink-0">
						<DateRangePicker />
					</div>
					<div className="flex items-center w-[200px] justify-end">
						<SettingsMenu />
					</div>
				</div>
			</Menubar>
		</div>
	);
}
