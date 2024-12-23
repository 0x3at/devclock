'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import {
	getTotalActiveTime,
	getTotalTime,
} from '@/lib/actions/session.actions';
import { formatHours } from '@/lib/utils/format-time';

export function ProductivityScoreStatCard({ label }: { label: string }) {
	const { dateRange } = useAppContext();
	const [stats, setStats] = useState({
		totalActiveTime: 0,
		totalTime: 0,
		score: 0,
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			const from = dateRange.from.getTime();
			const to = dateRange.to.getTime();

			const totalActiveTime = await getTotalActiveTime(from, to);
			const totalTime = await getTotalTime(from, to);
			const score =
				totalTime > 0 ? (totalActiveTime / totalTime) * 100 : 0;

			setStats({ totalActiveTime, totalTime, score });
		};

		fetchData();
	}, [dateRange]);

	return (
		<Card className="h-full">
			<CardContent className="h-full flex flex-col justify-center items-center p-6">
				<p className="text-sm font-medium uppercase text-muted-foreground mb-2">
					{label}
				</p>
				<p className="text-3xl font-bold mb-4">
					{stats.score.toFixed(2)}%
				</p>
				<div className="text-md">
					<p className="text-chart-active text-center">
						Active: {formatHours(stats.totalActiveTime, '')}
					</p>
					<p className="text-chart-1 text-center">
						Total: {formatHours(stats.totalTime, '')}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
