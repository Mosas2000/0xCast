import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

/**
 * Script to run Vite build with bundle analysis enabled.
 */
async function analyzeBundle() {
    console.log('Starting bundle analysis build...');

    await build({
        plugins: [
            visualizer({
                filename: 'dist/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            }),
        ],
        build: {
            outDir: 'dist-analysis',
        }
    });

    console.log('Analysis complete. Results available at dist/stats.html');
}

analyzeBundle().catch(err => {
    console.error('Bundle analysis failed:', err);
    process.exit(1);
});
