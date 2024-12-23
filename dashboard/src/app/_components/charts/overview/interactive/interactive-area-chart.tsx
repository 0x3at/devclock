'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { formatHours, formatTime } from '@/lib/utils/format-time';

import { Card, CardContent } from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

export function InteractiveAreaChart({
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
	activeMetric: string;
}) {
	return (
		<Card>
			{chartHeader}
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full">
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient
								id="fillActive"
								x1="0"
								y1="0"
								x2="0"
								y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--chart-active))"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--chart-active))"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient
								id="fillIdle"
								x1="0"
								y1="0"
								x2="0"
								y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--chart-idle))"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--chart-idle))"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient
								id="fillDebug"
								x1="0"
								y1="0"
								x2="0"
								y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--chart-debug))"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--chart-debug))"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
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
							tickFormatter={(value: number) =>
								formatHours(value, '', true)
							}
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
										});
									}}
									formatter={(value, name) =>
										formatTime(
											value as number,
											name as string
										)
									}
									indicator="dot"
								/>
							}
						/>
						{activeMetric === 'total' ? (
							<>
								<Area
									dataKey="active"
									type="natural"
									fill="url(#fillActive)"
									stroke="hsl(var(--chart-active))"
									stackId="a"
								/>
								<Area
									dataKey="debug"
									type="natural"
									fill="url(#fillDebug)"
									stroke="hsl(var(--chart-debug))"
									stackId="a"
								/>
								<Area
									dataKey="idle"
									type="natural"
									fill="url(#fillIdle)"
									stroke="hsl(var(--chart-idle))"
									stackId="a"
								/>
							</>
						) : (
							<Area
								dataKey={activeMetric}
								type="natural"
								fill={chartConfig[activeMetric].color}
								stroke={chartConfig[activeMetric].color}
								stackId="a"
							/>
						)}
						<ChartLegend content={<ChartLegendContent />} />
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
