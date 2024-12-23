import { HeroChart } from './_components/charts/overview/interactive/hero-chart';
import { LanguageProductivityTreemap } from './_components/charts/overview/sidebar/language-productivity-pie-chart';
import { TotalActiveTimeStatCard } from './_components/charts/overview/stat-cards/active-time-stat-card';
import { MostUsedLanguageStatCard } from './_components/charts/overview/stat-cards/most-used-lang-stat-card';
import { ProductivityScoreStatCard } from './_components/charts/overview/stat-cards/productivity-stat-card';

const defaultPeriod = {
	from: Date.now() - 7 * 24 * 60 * 60 * 1000,
	to: Date.now(),
};
export default async function Home({
	searchParams,
}: {
	searchParams: { strFrom: string; strTo: string };
}) {
	const { strFrom, strTo } = await searchParams;
	const from = strFrom ? parseInt(strFrom) : defaultPeriod.from;
	const to = strTo ? parseInt(strTo) : defaultPeriod.to;
	console.log(from, to);
	return (
		<>
			<main className="mt-5% flex justify-center w-full min-h-screen">
				<div className="w-full mt-20 grid grid-cols-3 auto-rows-min gap-4 justify-around border rounded-md p-5">
					<div className="col-span-1 row-start-1 border rounded-md aspect-[2/1] mb-0">
						<TotalActiveTimeStatCard label={'Total Active Time'} />
					</div>
					<div className="col-span-1 row-start-1 border rounded-md aspect-[2/1]">
						<MostUsedLanguageStatCard label="Most Used Language" />
					</div>
					<div className="col-span-1 row-start-1 border rounded-md aspect-[2/1]">
						<ProductivityScoreStatCard label="Productivity Score" />
					</div>
					<div className="row-start-2 col-span-3 row-span-1 mt-0 border rounded-md">
						<HeroChart />
					</div>
					<div className="row-start-3 col-span-3  border rounded-md">
						<LanguageProductivityTreemap />
					</div>
				</div>
			</main>
		</>
	);
}
