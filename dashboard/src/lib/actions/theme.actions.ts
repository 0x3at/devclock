import {
	getDefaultTheme,
	getThemeIdentifiers,
	getThemeList,
	updateDefaultTheme,
} from '@/lib/data/fetch.config';
import { ThemeList } from '@/types/config.s.t';

export type ThemeState = {
	defaultTheme: string;
	themeList: ThemeList;
	themeIdentifiers: string[];
};

export async function getThemeState(): Promise<ThemeState> {
	const [defaultTheme, themeList, themeIdentifiers] = await Promise.all([
		getDefaultTheme(),
		getThemeList(),
		getThemeIdentifiers(),
	]);

	return {
		defaultTheme,
		themeList,
		themeIdentifiers,
	};
}

export async function updateTheme(theme: string) {
	try {
		const newDefaultTheme = await updateDefaultTheme(theme);
		return { success: true, theme: newDefaultTheme };
	} catch (error) {
		console.error('Theme update failed:', error);
		return { success: false, error: `Failed to update theme \n${error}` };
	}
}
