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
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.html?$/i,
                loader: "html-loader",
            },
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
