import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/Main.ts',
    output: {
        file: 'build/index.js',
        format: 'cjs'
    },
    plugins: [
        typescript({ module: 'commonjs' }),
        commonjs(),
        nodeResolve(),
    ],
};
