import { Settings } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SettingsMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10">
				<Settings className="h-4 w-4" />
			</DropdownMenuTrigger>
			{/* <DropdownMenuContent
				align="center"
				avoidCollisions={true}
				collisionPadding={2}
				sideOffset={8}>
				<DropdownMenuItem className="text-center justify-center">
					Profile
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-center justify-center">
					Preferences
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-center justify-center">
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent> */}
		</DropdownMenu>
	);
}
