'use client';

import * as React from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { useAppContext } from '@/contexts/app-context';
import { getLanguagesProductivity } from '@/lib/actions/session.actions';

interface LanguageProductivity {
	name: string;
	size: number;
	totalLines: number;
	activeTime: number;
}

// Define colors for all languages
const chartConfig: ChartConfig = {
	javascript: { label: 'JavaScript', color: 'hsl(var(--lang-javascript))' },
	typescript: { label: 'TypeScript', color: 'hsl(var(--lang-typescript))' },
	python: { label: 'Python', color: 'hsl(var(--lang-python))' },
	java: { label: 'Java', color: 'hsl(var(--lang-java))' },
	ruby: { label: 'Ruby', color: 'hsl(var(--lang-ruby))' },
	go: { label: 'Go', color: 'hsl(var(--lang-go))' },
	rust: { label: 'Rust', color: 'hsl(var(--lang-rust))' },
	cpp: { label: 'C++', color: 'hsl(var(--lang-cpp))' },
	csharp: { label: 'C#', color: 'hsl(var(--lang-csharp))' },
	php: { label: 'PHP', color: 'hsl(var(--lang-php))' },
	html: { label: 'HTML', color: 'hsl(var(--lang-html))' },
	css: { label: 'CSS', color: 'hsl(var(--lang-css))' },
	json: { label: 'JSON', color: 'hsl(var(--lang-json))' },
	markdown: { label: 'Markdown', color: 'hsl(var(--lang-markdown))' },
	yaml: { label: 'YAML', color: 'hsl(var(--lang-yaml))' },
	typescriptreact: {
		label: 'TypeScript React',
		color: 'hsl(var(--lang-typescriptreact))',
	},
	javascriptreact: {
		label: 'JavaScript React',
		color: 'hsl(var(--lang-javascriptreact))',
	},
	// Add other languages as needed
};

export function LanguageProductivityTreemap() {
	const { dateRange } = useAppContext();
	const [data, setData] = React.useState<LanguageProductivity[]>([]);
	const [totalLines, setTotalLines] = React.useState<number>(0);

	React.useEffect(() => {
		const fetchData = async () => {
			if (!dateRange?.from || !dateRange?.to) return;

			const from = dateRange.from.getTime();
			const to = dateRange.to.getTime();

			const languagesData = await getLanguagesProductivity(from, to);

			// Transform data for the treemap
			const transformedData = languagesData.languages.map((lang) => ({
				name: lang.language,
				size: lang.totalLines, // Using total lines for size instead of productivity
				totalLines: lang.totalLines,
				activeTime: lang.activeTime,
				fill:
					chartConfig[lang.language as keyof typeof chartConfig]
						?.color || 'hsl(var(--lang-plaintext))',
			}));

			setData(transformedData);
			setTotalLines(languagesData.totalLines);
		};

		fetchData();
	}, [dateRange]);

	return (
		<Card className="flex flex-col h-full">
			<CardHeader>
				<CardTitle>Language Distribution</CardTitle>
				<CardDescription>Lines of code by language</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-1 justify-center items-center pb-0">
				<ChartContainer
					config={chartConfig}
					className="w-full h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<Treemap
							data={data}
							dataKey="size"
							aspectRatio={4 / 3}
							stroke="hsl(var(--text-foreground))"
							fill="hsl(var(--text-foreground))">
							<ChartTooltip
								content={({ active, payload }) => {
									if (!active || !payload?.length)
										return null;
									const data = payload[0]
										.payload as LanguageProductivity;
									return (
										<div className="rounded-lg bg-background p-2 shadow-md border border-border">
											<p className="font-medium">
												{chartConfig[
													data.name as keyof typeof chartConfig
												]?.label || data.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{data.totalLines.toLocaleString()}{' '}
												lines
											</p>
										</div>
									);
								}}
							/>
						</Treemap>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
