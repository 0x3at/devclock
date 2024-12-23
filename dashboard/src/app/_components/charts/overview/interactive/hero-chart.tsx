'use client';
import { BarChart3, LineChart } from 'lucide-react';
import { InteractiveAreaChart } from './interactive-area-chart';
import { InteractiveBarChart } from './interactive-bar-chart';
import { InteractiveStackedBarChart } from './interactive-stacked-bar-chart';
import { ChartConfig } from '@/components/ui/chart';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as React from 'react';
import { formatTime } from '@/lib/utils/format-time';
import { Toggle } from '@/components/ui/toggle';
import { useAppContext } from '@/contexts/app-context';
import { getSessionsData } from '@/lib/actions/session.actions';

const chartConfig = {
	active: {
		label: 'active',
		color: 'hsl(var(--chart-active))',
	},
	idle: {
		label: 'idle',
		color: 'hsl(var(--chart-idle))',
	},
	debug: {
		label: 'debug',
		color: 'hsl(var(--chart-debug))',
	},
} satisfies ChartConfig;

export function HeroChart() {
	const { dateRange } = useAppContext();
	const [filteredData, setFilteredData] = React.useState<
		Array<{
			date: string;
			active: number;
			idle: number;
			debug: number;
			duration: number;
		}>
	>([]);

	const [activeMetric, setActiveMetric] = React.useState<
		keyof typeof chartConfig | 'total'
	>('total');
	const [isBarChart, setBarChart] = React.useState<boolean>(true);
	const [stats, setStats] = React.useState({
		total: {
			active: 0,
			debug: 0,
			idle: 0,
		},
		totalTime: 0,
	});

	React.useEffect(() => {
		const fetchData = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			const from = dateRange.from.getTime();
			const to = dateRange.to.getTime();

			const sessionsData = await getSessionsData(from, to);

			// Create a map of dates to ensure we have all dates in range
			const dateMap = new Map();
			const currentDate = new Date(from);
			const endDate = new Date(to);

			while (currentDate <= endDate) {
				const dateKey = currentDate.toISOString().split('T')[0];
				dateMap.set(dateKey, {
					date: dateKey,
					active: 0,
					idle: 0,
					debug: 0,
					duration: 0,
				});
				currentDate.setDate(currentDate.getDate() + 1);
			}

			// Fill in the actual data
			sessionsData.sessions.forEach((session) => {
				const dateKey = new Date(session.startTime)
					.toISOString()
					.split('T')[0];
				if (dateMap.has(dateKey)) {
					const data = dateMap.get(dateKey);
					data.active = session.activeTime;
					data.idle = session.idleTime;
					data.debug = session.debugTime;
					data.duration = session.duration;
				}
			});

			// Convert map to array and sort by date
			const transformedData = Array.from(dateMap.values()).sort(
				(a, b) =>
					new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			setFilteredData(transformedData);
		};

		fetchData();
	}, [dateRange]);

	React.useEffect(() => {
		const calculateTotals = () => {
			const newTotal = {
				active: filteredData.reduce(
					(acc, curr) => acc + curr.active,
					0
				),
				debug: filteredData.reduce((acc, curr) => acc + curr.debug, 0),
				idle: filteredData.reduce((acc, curr) => acc + curr.idle, 0),
			};

			const totalDuration = filteredData.reduce(
				(acc, curr) => acc + curr.duration,
				0
			);

			setStats({
				total: newTotal,
				totalTime: totalDuration,
			});
		};

		calculateTotals();
	}, [filteredData]);

	const chartHeader = (
		<CardHeader className="flex container-fluid flex-col items-stretch space-y-0 p-0 sm:flex-row">
			<div className="flex items-center justify-center px-6 py-6">
				<Toggle
					pressed={isBarChart}
					onPressedChange={() => setBarChart(!isBarChart)}
					aria-label="Toggle chart type"
					className="data-[state=on]:bg-muted">
					{isBarChart ? (
						<LineChart className="h-4 w-4" />
					) : (
						<BarChart3 className="h-4 w-4" />
					)}
				</Toggle>
			</div>
			<div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
				<CardTitle>Time Distribution</CardTitle>
				<CardDescription>Activity time distribution</CardDescription>
			</div>
			<div className="flex flex-wrap sm:flex-nowrap">
				{(['total', 'active', 'debug', 'idle'] as const).map((key) => (
					<button
						key={key}
						data-active={activeMetric === key}
						className="container z-30 flex flex-1 min-w-[120px] flex-col justify-center gap-1 border-t px-4 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6 sm:py-6"
						onClick={() => setActiveMetric(key)}>
						<span className="text-xs text-muted-foreground whitespace-nowrap">
							{key === 'total' ? 'total' : chartConfig[key].label}
						</span>
						<span className="text-lg font-bold leading-none sm:text-2xl whitespace-nowrap">
							{formatTime(
								key === 'total'
									? stats.totalTime
									: stats.total[key],
								''
							)
								.split(':')[1]
								.trim()}
						</span>
					</button>
				))}
			</div>
		</CardHeader>
	);

	return (
		<div className="w-full">
			{activeMetric === 'total' && isBarChart ? (
				<InteractiveStackedBarChart
					filteredData={filteredData}
					chartHeader={chartHeader}
					chartConfig={chartConfig}
				/>
			) : isBarChart ? (
				<InteractiveBarChart
					filteredData={filteredData}
					chartHeader={chartHeader}
					chartConfig={chartConfig}
					activeMetric={activeMetric}
					totalTime={stats.totalTime}
				/>
			) : (
				<InteractiveAreaChart
					filteredData={filteredData}
					chartHeader={chartHeader}
					chartConfig={chartConfig}
					activeMetric={activeMetric}
				/>
			)}
		</div>
	);
}
