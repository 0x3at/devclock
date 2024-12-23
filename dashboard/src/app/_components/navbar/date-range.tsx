'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useAppContext } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';

export function DateRangePicker() {
	const { dateRange, setDateRange } = useAppContext();
	const router = useRouter();
	const handleDateChange = (newDate: DateRange | undefined) => {
		setDateRange(newDate);
		if (newDate?.from && newDate?.to) {
			if (newDate?.from <= newDate.to) {
				const params = new URLSearchParams();
				params.set('from', newDate.from.getTime().toString());
				params.set('to', newDate.to.getTime().toString());
				router.replace(`/?${params.toString()}`);
			}
		}
	};
	return (
		<div className={cn('grid gap-2')}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={'ghost'}
						className={cn(
							'w-[300px] justify-center items-center text-center font-normal h-9 px-4',
							!dateRange && 'text-muted-foreground'
						)}>
						<div className="flex items-center">
							<CalendarIcon className="mr-2 h-4 w-4" />
							{dateRange?.from ? (
								dateRange.to ? (
									<>
										{format(dateRange.from, 'LLL dd, y')} -{' '}
										{format(dateRange.to, 'LLL dd, y')}
									</>
								) : (
									format(dateRange.from, 'LLL dd, y')
								)
							) : (
								<span>Pick a date</span>
							)}
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-4" align="center">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={dateRange?.from}
						selected={dateRange}
						onSelect={handleDateChange}
						numberOfMonths={1}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
