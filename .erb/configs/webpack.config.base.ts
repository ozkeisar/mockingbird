/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';
import CopyWebpackPlugin from 'copy-webpack-plugin'

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {}),'fsevents'],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    // There is no need to add aliases here, the paths in tsconfig get mirrored
    plugins: [new TsconfigPathsPlugins()],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new CopyWebpackPlugin({
      patterns: [
          './node_modules/swagger-ui-dist/swagger-ui.css',
          './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
          './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
          './node_modules/swagger-ui-dist/favicon-16x16.png',
          './node_modules/swagger-ui-dist/favicon-32x32.png'
      ]
  })
  ],
};

export default configuration;
