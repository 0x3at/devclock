import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider';
import { AppProvider } from '@/contexts/app-context';
import { FloatingNavBar } from './_components/custom-navbar';
import { getThemeState } from '@/lib/actions/theme.actions';

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
	other: {
		'darkreader-lock': 'true',
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const themeState = await getThemeState();
	console.log('Theme State Fetched', themeState);
	console.log('Theme Identifiers Fetched', themeState.themeIdentifiers);
	return (
		<html lang="en">
			<body suppressHydrationWarning={true} className="antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme={
						themeState.defaultTheme
							? themeState.defaultTheme
							: 'system'
					}
					themes={
						themeState.themeIdentifiers.length > 0
							? themeState.themeIdentifiers
							: [
									'light',
									'dark',
									'latte',
									'mocha',
									'tokyo-night',
									'tokyo-light',
									'darcula',
									'git-dark',
									'git-light',
									'owl-dark',
									'owl-light',
							  ]
					}
					enableSystem
					disableTransitionOnChange>
					<AppProvider>
						<main className="container align-center mx-auto min-w-screen-md rounded-md px-12">
							<FloatingNavBar themeState={themeState} />
							<div className="flex min-h-svh flex-1 flex-col ">
								{children}
							</div>
						</main>
					</AppProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
