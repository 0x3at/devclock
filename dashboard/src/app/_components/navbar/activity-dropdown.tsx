'use client';
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';
export function ActivityMenu() {
	const _views = ['Overview', 'Activity', 'Languages'];
	const {
		dateRange,
		setDateRange: _setDateRange,
		currentView,
		setCurrentView,
	} = useAppContext();
	const router = useRouter();
	const _replaceView = (route: string) => {
		setCurrentView(route);
		const params = new URLSearchParams();
		params.set('strFrom', dateRange!.from!.getTime().toString());
		params.set('strTo', dateRange!.to!.getTime().toString());
		router.replace(
			`${route === 'Overview' ? '/' : route}?${params.toString()}`
		);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex font-semibold whitespace-nowrap text-nowrap p-0.5 rounded-sm transition-colors hover:bg-accent">
				{currentView}
			</DropdownMenuTrigger>
			{/* <DropdownMenuContent
				align="center"
				avoidCollisions={true}
				collisionPadding={2}
				sideOffset={8}>
				{views
					.filter((view) => view !== currentView)
					.map((view, index, array) => (
						<Fragment key={view}>
							<DropdownMenuItem
								onClick={() => replaceView(view)}
								className="text-center justify-center">
								{view}
							</DropdownMenuItem>
							{index !== array.length - 1 && (
								<DropdownMenuSeparator />
							)}
						</Fragment>
					))}
			</DropdownMenuContent> */}
		</DropdownMenu>
	);
}
