'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { formatHours, formatTime } from '@/lib/utils/format-time';

import { Card, CardContent } from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

export function InteractiveBarChart({
	filteredData,
	chartHeader,
	chartConfig,
	activeMetric,
}: {
	filteredData: {
		date: string;
		active: number;
		idle: number;
		debug: number;
	}[];
	chartHeader: React.ReactNode;
	chartConfig: ChartConfig;
	activeMetric: keyof typeof chartConfig;
	totalTime: number;
}) {
	return (
		<Card>
			{chartHeader}
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full">
					<BarChart
						accessibilityLayer
						data={filteredData}
						margin={{
							left: 12,
							right: 12,
						}}>
						<CartesianGrid vertical={false} />
						<YAxis
							type="number"
							domain={[
								0,
								Math.max(
									...filteredData.map(
										(session: (typeof filteredData)[1]) => {
											return (
												session.active +
												session.idle +
												session.debug
											);
										}
									)
								),
							]}
							tickFormatter={(value) => formatHours(value)}
						/>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value);
								return date.toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
								});
							}}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										return new Date(
											value
										).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										});
									}}
									formatter={(value, name) =>
										formatTime(
											value as number,
											name as string
										)
									}
								/>
							}
						/>
						<Bar
							dataKey={activeMetric}
							fill={chartConfig[activeMetric].color}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
