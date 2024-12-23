'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHours } from '@/lib/utils/format-time';
import { getTotalActiveTime } from '@/lib/actions/session.actions';
import { useAppContext } from '@/contexts/app-context';

interface Props {
	label: string;
}

export function TotalActiveTimeStatCard({ label }: Props) {
	const { dateRange } = useAppContext();
	const [stats, setStats] = useState({
		value: '0',
		previousTotal: '0',
		percentage: 0,
		increase: false,
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			const from = dateRange.from.getTime();
			const to = dateRange.to.getTime();
			const timeDiff = to - from;

			const currentTotal = await getTotalActiveTime(from, to);
			const previousTotal = await getTotalActiveTime(
				from - timeDiff,
				from
			);

			setStats({
				value: formatHours(currentTotal, ''),
				previousTotal: formatHours(previousTotal, ''),
				percentage: (currentTotal / previousTotal) * 100,
				increase: currentTotal > previousTotal,
			});
		};

		fetchData();
	}, [dateRange]);

	return (
		<Card className="h-full">
			<CardContent className="h-full flex flex-col justify-center items-center p-6">
				<p className="text-sm font-medium uppercase text-muted-foreground mb-2">
					{label}
				</p>
				<p className="text-3xl font-bold mb-4">{stats.value}</p>
				<div className="flex items-center">
					{stats.increase ? (
						<ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
					) : (
						<ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
					)}
					<span
						className={cn(
							'text-sm font-medium',
							stats.increase ? 'text-green-500' : 'text-red-500'
						)}>
						{stats.percentage.toFixed(2)}%
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
