export type ThemeList = Theme[];

export type Theme = {
	label: string;
	opts: {
		label: string;
		identifier: string;
	}[];
};

export type Config = {
	default_theme: string;
	data_path: string;
	theme_list: ThemeList;
};
