/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
// import checkNodeEnv from '../scripts/check-node-env';

// checkNodeEnv('production');

const configuration: webpack.Configuration = {

  target:'node',

  mode: 'production',

  entry: {
    main: path.join(webpackPaths.srcBackendPath, 'run.ts'),
  },

  output: {
    path: webpackPaths.distBackendPath,
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },

  plugins: [
    // new BundleAnalyzerPlugin({
    //   analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    //   analyzerPort: 8888,
    // }),

    // /**
    //  * Create global constants which can be configured at compile time.
    //  *
    //  * Useful for allowing different behaviour between development builds and
    //  * release builds
    //  *
    //  * NODE_ENV should be production so that modules do not perform certain
    //  * development checks
    //  */
    // new webpack.EnvironmentPlugin({
    //   NODE_ENV: 'production',
    //   DEBUG_PROD: false,
    //   START_MINIMIZED: false,
    // }),

    // new webpack.DefinePlugin({
    //   'process.type': '"browser"',
    // }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
