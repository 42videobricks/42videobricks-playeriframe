// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'umd',
            name: 'Api42Videobricks',
            sourcemap: true
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
            plugins: [terser()],
            sourcemap: true
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**'
        })
    ]
};