'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { getTopLanguage } from '@/lib/actions/session.actions';
import { formatHours } from '@/lib/utils/format-time';
// import { ChartContainer } from '@/components/ui/chart';
// import { RadialBar, RadialBarChart, Legend, Tooltip } from 'recharts';

interface LanguageStats {
	label: string;
	totalTime: number;
	totalLines: number;
}

export function MostUsedLanguageStatCard({ label }: { label: string }) {
	const { dateRange } = useAppContext();
	const [stats, setStats] = useState<LanguageStats>({
		label: '',
		totalTime: 0,
		totalLines: 0,
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			const from = dateRange.from.getTime();
			const to = dateRange.to.getTime();

			const topLanguage = await getTopLanguage(from, to);
			setStats(topLanguage);
		};

		fetchData();
	}, [dateRange]);

	return (
		<Card className="h-full">
			<CardContent className="h-full flex flex-col justify-center items-center p-6">
				<p className="text-sm font-medium uppercase text-muted-foreground mb-2">
					{label}
				</p>
				<p className="text-3xl font-bold mb-4">{stats.label}</p>
				<div className="text-sm text-chart-active">
					<p className="text-center">
						{formatHours(stats.totalTime, 'Active', true)}
					</p>
					<p className="text-center">
						{stats.totalLines.toLocaleString()} lines
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
