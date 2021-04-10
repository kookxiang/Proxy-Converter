const path = require('path')

module.exports = {
    bail: true,
    cache: {
        type: 'filesystem',
    },
    output: {
        filename: 'worker.js',
        path: path.join(__dirname, 'dist'),
    },
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
}
