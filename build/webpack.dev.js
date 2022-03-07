// const { merge } = require('webpack-merge');
// const common = require('./webpack.config.js');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const path = require('path');


import { merge } from 'webpack-merge';
import { common } from './webpack.config.js';
import HtmlWebpackPlugin  from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default merge(common, {
  mode: 'development',
  plugins: [

    new CleanWebpackPlugin(),
    //  you should know that the HtmlWebpackPlugin by default will generate its own index.html
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[contenthash].css',
      // chunkFilename: devMode ? '[id].[hash].css' : '[id].css',
    }),
  ],
  output: {
    // filename: '[name].[contenthash].js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 50000,
    static: '../dist',
    hot: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:9999",
        pathRewrite: {"^/api" : ""}
      }
    }
  },
});
