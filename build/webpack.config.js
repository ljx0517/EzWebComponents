// const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const resolve = dir => path.join(__dirname, '..', dir);

import { fileURLToPath } from 'url';
const isDev =process.env.NODE_ENV == 'dev'
const sourceMap = isDev;
const minimize = !isDev; //we only minimise in production en
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path, { dirname } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'
import fs from 'fs';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
// import ConsoleLogOnBuildWebpackPlugin from './style_file_loader.js';
const resolve = dir => path.join(__dirname, '..', dir)
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

const componentsDirs = fs.readdirSync(path.resolve(__dirname, '../src/components'));
const entry = {
  main: './src/main.ts',
  httpclient: './src/common/httpclient.ts',
}
componentsDirs.forEach(folder => {
  entry[folder] = path.resolve(__dirname, '../src/components', folder, 'index.ts');
});

const comps = fs.readdirSync(path.resolve(__dirname, '../src/examples'));
const navList = {'0. Home':[
    {
      label: '0. intro',
      link:  'home.html'
    }
  ]}
export const examples = comps.reduce((prev, folder) => {
  const exam = path.resolve(__dirname, '../src/examples', folder);
  const files = fs.readdirSync(exam);
  const pages = files.filter(f => {
    return f.endsWith(`.html`)
  })
  const docs = files.filter(f => {
    return f.endsWith(`.md`)
  })
  const examplePage = pages.map(p => {

    const [group, sub] = p.split('~')
    if (!navList[group]) {
      navList[group] = []
    }
    navList[group].push({
      label: sub.replace('.html', ''),
      link:  path.join('examples', folder, p)
    });
    const docFile =p.replace('.html', '.md')
    let docContent = '';
    const docPath = path.join(exam, docFile)
    if (fs.existsSync(docPath)) {
      const mdContent = fs.readFileSync(path.join(exam, docFile))
      docContent = md.render(mdContent.toString().trim());
    }
    return new HtmlWebpackPlugin({
      template: path.join(exam, p), // relative path to the HTML files
      filename: path.join('examples', folder, p), // output HTML files
      publicPath: '../../',
      scriptLoading: 'module',
      docContent,
      chunks: [`${folder}`] // respective JS files
    })
  })
  return prev.concat(examplePage)
}, [])



const common = {
  watch: true,
  target: "web",

  entry,
  // entry: {
  //   // 'httpclient': './src/common/httpclient.ts',
  //   // 'ez-tabs-list': './src/components/ez-tabs-list/index.ts',
  //   // 'ez-pop-wrapper': './src/components/ez-pop-wrapper/index.ts',
  //   // 'ez-widget': './src/components/ez-widget/index.ts',
  //   // 'ez-resize-panel': './src/components/ez-resize-panel/index.ts',
  // },
  output: {
    scriptType: 'module',
  },
  experiments: {
    outputModule: true,
  },
  // output: {
  //   module: true,
  // },
  module: {
    rules: [
      // {
      //   test: require.resolve('jquery'),
      //   loader: 'expose-loader?jQuery!expose-loader?$'
      // },
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],

          }
        },
        include: [resolve('src'), resolve('test')],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "css-loader",
            options: {
              // modules: true,
              esModule: false,
              // esModule: true,
              importLoaders: 1,
              modules: {
                // auto: /\.custom-module\.\w+$/i,
                auto: /\.module\.css$/,
              },
              // url: "[name]_[local]_[hash:base64]",
              sourceMap,
              minimize,
              // onlyLocals: true,
              // localsConvention: 'camelCase'
            }
          }
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: path.resolve(__dirname, 'style_file_loader.cjs'),
            options: {
              modules: true,
            }
          },

          { loader: 'css-loader', options: {
              sourceMap,
              esModule: false,
              importLoaders: 1,
              modules: {
                auto: /\.module\.less$/,
                exportLocalsConvention: 'camelCase',
                exportOnlyLocals: false,
                localIdentName: isDev ? '[local]' : '[sha1:hash:hex:4]',
              },
            }
          },
          { loader: 'less-loader' },
        ],
        include:  /\.module\.less$/
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   scriptLoading: 'module'
    // })
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'EzWebcomponents',
      templateParameters: {
        navList
      }
    }),
    new HtmlWebpackPlugin({
      template: './home.html',
      filename: 'home.html',
      title: 'home',
      scriptLoading: 'module',
      chunks: []
    }),

  ]
};
common.plugins = common.plugins.concat(examples)
export {common};
