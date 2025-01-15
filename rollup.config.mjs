// rollup.config.mjs
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import strip from 'rollup-plugin-strip';


const config = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'umd',
                name: 'Api42Videobricks',
                sourcemap: true,
                exports: 'default',

            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                sourcemap: true
            },
            {
                file: 'dist/index.min.js',
                format: 'umd',
                name: 'Api42Videobricks',
                plugins: [terser({
                    compress: {
                        pure_funcs: ['console.log'], // Supprime tous les `console.log`
                    },
                })],
                sourcemap: true
            }
        ],

        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: './dist/types',
            }),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            })
        ]
    },
    // Configuration pour générer les fichiers de déclaration TypeScript
    {
        input: 'dist/types/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [dts()]
    }
];

export default config;