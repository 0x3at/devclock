'use server';

import * as fs from 'fs/promises';
import { Config, ThemeList } from '@/types/config.s.t';

// Private helper function to read config
async function readConfig(): Promise<Config> {
	const configData = await fs.readFile(
		'src/app/_config/devclock.config.json',
		'utf-8'
	);
	return JSON.parse(configData);
}

// Server actions - these can be imported and used in client components
export async function getDataPath(): Promise<string> {
	const config = await readConfig();
	return config.data_path;
}

export async function getDefaultTheme(): Promise<string> {
	const config = await readConfig();
	return config.default_theme;
}

export async function getThemeList(): Promise<ThemeList> {
	const config = await readConfig();
	return config.theme_list;
}

export async function getThemeIdentifiers(): Promise<string[]> {
	const config = await readConfig();
	const identifiers = Object.values(config.theme_list).flatMap((theme) =>
		theme.opts.map((opt) => opt.identifier)
	);
	console.log('Fetched theme identifiers:', identifiers);
	return identifiers;
}
/*
0: "light"
​
1: "dark"
​
2: "latte"
​
3: "mocha"
​
4: "tokyo-light"
​
5: "tokyo-night"
​
6: "git-light"
​
7: "git-dark"
​
8: "owl-dark"
​
9: "owl-light"
​
10: "darcula"
*/

export async function updateDefaultTheme(
	themeIdentifier: string
): Promise<string> {
	const config = await readConfig();

	if (config.theme_list && themeIdentifier) {
		config.default_theme = themeIdentifier;
		await fs.writeFile(
			'src/app/_config/devlock.config.json',
			JSON.stringify(config, null, 2)
		);
	}
	const updatedConfig = await readConfig();
	return updatedConfig.default_theme;
}

export async function resetConfig(): Promise<void> {
	const defaultConfig = await fs.readFile(
		'src/app/_config/default.devlock.config.json',
		'utf-8'
	);
	await fs.writeFile('src/app/_config/devlock.config.json', defaultConfig);
}
