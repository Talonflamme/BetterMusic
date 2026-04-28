const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== "production";

    // clean folder
    fs.readdirSync(path.resolve(__dirname, "dist")).forEach(sub => fs.rmSync(path.join(__dirname, "dist", sub), { recursive: true }));

    return [
        // Renderer
        {
            entry: './src/renderer.tsx',
            mode: isDevelopment ? 'development' : 'production',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'renderer.js',
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js']
            },
            devtool: isDevelopment ? 'inline-source-map' : 'source-map',
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx)$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                sourceMaps: true,
                            }
                        },
                        exclude: /node_modules/
                    },
                    {
                        test: /\.scss$/,
                        use: ['style-loader', 'css-loader', 'sass-loader']
                    }
                ]
            },
            target: 'electron-renderer',
            plugins: [
                new CopyWebpackPlugin({
                    patterns: [
                        { from: 'public', to: './public' },
                        { from: 'assets', to: './assets' }
                    ]
                })
            ]
        },
        // Main
        {
            entry: './src/main.ts',
            target: 'electron-main',
            mode: isDevelopment ? 'development' : 'production',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'main.js'
            },
            resolve: {
                extensions: ['.ts', '.js']
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'babel-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            devtool: isDevelopment ? 'inline-source-map' : 'source-map'
        }];
};