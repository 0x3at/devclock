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
	// Core languages
	javascript: { label: 'JavaScript', color: 'hsl(var(--lang-javascript))' },
	typescript: { label: 'TypeScript', color: 'hsl(var(--lang-typescript))' },
	python: { label: 'Python', color: 'hsl(var(--lang-python))' },
	java: { label: 'Java', color: 'hsl(var(--lang-java))' },
	csharp: { label: 'C#', color: 'hsl(var(--lang-csharp))' },
	cpp: { label: 'C++', color: 'hsl(var(--lang-cpp))' },
	ruby: { label: 'Ruby', color: 'hsl(var(--lang-ruby))' },
	go: { label: 'Go', color: 'hsl(var(--lang-go))' },
	rust: { label: 'Rust', color: 'hsl(var(--lang-rust))' },

	// Web technologies
	html: { label: 'HTML', color: 'hsl(var(--lang-html))' },
	css: { label: 'CSS', color: 'hsl(var(--lang-css))' },
	scss: { label: 'SCSS', color: 'hsl(var(--lang-scss))' },
	less: { label: 'Less', color: 'hsl(var(--lang-less))' },

	// React ecosystem
	typescriptreact: {
		label: 'TypeScript React',
		color: 'hsl(var(--lang-typescriptreact))',
	},
	javascriptreact: {
		label: 'JavaScript React',
		color: 'hsl(var(--lang-javascriptreact))',
	},

	// Other web frameworks
	vue: { label: 'Vue', color: 'hsl(var(--lang-vue))' },
	'vue-html': { label: 'Vue HTML', color: 'hsl(var(--lang-vue-html))' },
	svelte: { label: 'Svelte', color: 'hsl(var(--lang-svelte))' },

	// Data formats
	json: { label: 'JSON', color: 'hsl(var(--lang-json))' },
	jsonc: { label: 'JSONC', color: 'hsl(var(--lang-jsonc))' },
	yaml: { label: 'YAML', color: 'hsl(var(--lang-yaml))' },
	xml: { label: 'XML', color: 'hsl(var(--lang-xml))' },

	// Shell and scripting
	shellscript: {
		label: 'Shell Script',
		color: 'hsl(var(--lang-shellscript))',
	},
	powershell: { label: 'PowerShell', color: 'hsl(var(--lang-powershell))' },
	bat: { label: 'Batch', color: 'hsl(var(--lang-bat))' },

	// Documentation
	markdown: { label: 'Markdown', color: 'hsl(var(--lang-markdown))' },

	// Other languages
	c: { label: 'C', color: 'hsl(var(--lang-c))' },
	php: { label: 'PHP', color: 'hsl(var(--lang-php))' },
	swift: { label: 'Swift', color: 'hsl(var(--lang-swift))' },
	perl: { label: 'Perl', color: 'hsl(var(--lang-perl))' },
	lua: { label: 'Lua', color: 'hsl(var(--lang-lua))' },
	r: { label: 'R', color: 'hsl(var(--lang-r))' },

	// Database
	sql: { label: 'SQL', color: 'hsl(var(--lang-sql))' },

	// Configuration
	dockerfile: { label: 'Dockerfile', color: 'hsl(var(--lang-dockerfile))' },
	dockercompose: {
		label: 'Docker Compose',
		color: 'hsl(var(--lang-dockercompose))',
	},

	// Default fallback
	plaintext: { label: 'Plain Text', color: 'hsl(var(--lang-plaintext))' },
};

export function LanguageProductivityTreemap() {
	const { dateRange } = useAppContext();
	const [data, setData] = React.useState<LanguageProductivity[]>([]);

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
							fill="hsl(var(--text-foreground))"
							className="text-foreground">
							<ChartTooltip
								content={({ active, payload }) => {
									if (!active || !payload?.length)
										return null;
									const data = payload[0]
										.payload as LanguageProductivity;
									return (
										<div className="rounded-lg bg-background p-2 shadow-md border border-border">
											<p className="font-bold text-foreground">
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
