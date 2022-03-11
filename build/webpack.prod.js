// const path = require('path');
// const {merge} = require('webpack-merge');
// const common = require('./webpack.config.js');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// // https://stackoverflow.com/questions/50260262/how-to-run-webpack-bundle-analyzer
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


import path, { dirname } from 'path';
import {merge} from 'webpack-merge';
import { common}  from './webpack.config.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin} from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// https://stackoverflow.com/questions/50260262/how-to-run-webpack-bundle-analyzer
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'; // ).BundleAnalyzerPlugin
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


const config = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsOptions: { source: false }
    }),

    //  you should know that the HtmlWebpackPlugin by default will generate its own index.html
    // new HtmlWebpackPlugin({
    //   template: './index.html',
    //   title: 'EzWebcomponents',
    // }),
    // new HtmlWebpackPlugin({
    //   template: './index.html',
    // }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      // chunkFilename: devMode ? '[id].[hash].css' : '[id].css',
    }),
    {
      apply: (compiler) => {
        compiler.hooks.done.tap('DonePlugin', (stats) => {
          console.log('Compile is done !')
          if (stats.compilation.errors && stats.compilation.errors.length) {
            console.error(stats.compilation.errors)
          }
          setTimeout(() => {
            process.exit(0)
          })
        });
        // compiler.hooks.failed.tap('ErrorPlugin', (error) => {
        //   console.log('Compile is error !')
        //   console.error(error)
        // }),
        // compiler.hooks.invalid.tap('InvalidPlugin', (fileName, changeTime) => {
        //   console.log('Compile is InvalidPlugin !')
        //   console.error(fileName, changeTime)
        // })

      }
    }
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
});


export default config


