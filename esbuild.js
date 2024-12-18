const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
	const isProduction = process.argv.includes('--production');
	const isWatch = process.argv.includes('--watch');
	const outDir = 'dist';

	// Clean dist directory
	if (fs.existsSync(outDir)) {
		fs.rmSync(outDir, { recursive: true });
	}
	fs.mkdirSync(outDir);

	try {
		// Bundle the extension
		const buildOptions = {
			entryPoints: ['src/extension.ts'],
			bundle: true,
			outfile: path.join(outDir, 'extension.js'),
			platform: 'node',
			target: 'node16',
			format: 'cjs',
			sourcemap: !isProduction,
			minify: isProduction,
			minifyWhitespace: isProduction,
			minifyIdentifiers: false,
			minifySyntax: isProduction,
			treeShaking: true,
			metafile: true,
			external: ['vscode'],

			define: {
				'process.env.NODE_ENV': JSON.stringify(
					isProduction ? 'production' : 'development'
				),
			},
			loader: {
				'.ts': 'ts',
			},
			keepNames: true,
			legalComments: 'inline',
		};

		if (isWatch) {
			const ctx = await esbuild.context(buildOptions);
			await ctx.watch();
			console.log('Watching for changes...');
		} else {
			const result = await esbuild.build(buildOptions);

			// Create production package.json
			const pkg = require('./package.json');
			const distPkg = {
				name: pkg.name,
				displayName: pkg.displayName,
				description: pkg.description,
				version: pkg.version,
				publisher: pkg.publisher || 'devclock',
				engines: pkg.engines,
				categories: pkg.categories,
				activationEvents: [
					...pkg.activationEvents,
					'onCommand:devclock.execDebug',
					'onCommand:devclock.showDashboard',
					'onCommand:devclock.showSessionDetails',
					'onCommand:devclock.deactivate',
				],
				contributes: pkg.contributes,
				main: './extension.js',
			};

			fs.writeFileSync(
				path.join(outDir, 'package.json'),
				JSON.stringify(distPkg, null, 2)
			);

			// Copy package.json to dist for debugging
			if (!isProduction) {
				fs.copyFileSync(
					'package.json',
					path.join(outDir, 'package.original.json')
				);
			}

			console.log(`Build complete! Output directory: ${outDir}`);
		}
	} catch (error) {
		console.error('Build failed:', error);
		process.exit(1);
	}
}

build();
