const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = dir => path.join(__dirname, '..', dir);

module.exports = {
  watch: true,
  target: "web",
  entry: {
    'ez-tabs-list': './src/components/ez-tabs-list/ez-tabs-list.ts',
    'ez-pop-wrapper': './src/components/ez-pop-wrapper/ez-pop-wrapper.ts',
    'ez-t-renderer': './src/components/ez-t-renderer/ez-t-renderer.ts',
  },
  module: {
    rules: [
      // {
      //   test: require.resolve('jquery'),
      //   loader: 'expose-loader?jQuery!expose-loader?$'
      // },
      {
        test: /\.js$/,
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
          // MiniCssExtractPlugin.loader, // instead of style-loader
          // 'style-loader',
          // 'css-loader',
          // { loader: 'css-loader', options: { modules: true } }
          // {
          //   loader: "@teamsupercell/typings-for-css-modules-loader",
          //   options: {
          //     // pass all the options for `css-loader` to `css-loader`, eg.
          //     banner: "// autogenerated by typings-for-css-modules-loader.",
          //     aaa: 'asd'
          //   }
          // },
          // {
          //   loader: 'style-loader',
          //   options: {
          //     insert: function (element) {
          //       console.log(111111111);
          //       const parent = document.querySelector('assets-component');
          //
          //     // ***This what i want, to inject inside the shadowRoot but it
          //     //   never steps inside since the shadowRoot not created yet***
          //
          //       if (parent.shadowRoot) {
          //         parent.shadowRoot.appendChild(element);
          //       }
          //       parent.appendChild(element);
          //     },
          //   },
          // },
          {
            loader: "css-loader",
            options: {
              // modules: true,
              esModule: false,
              // esModule: true,
              importLoaders: 1,
              modules: {
                // auto: /\.module\.css$/,
              },
              // url: "[name]_[local]_[hash:base64]",
              // sourceMap: true,
              // minimize: true,
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
        // exclude: /\.module\.css$/
      },
      {
        test: /\.less$/,
        use: [
          // MiniCssExtractPlugin.loader,
          // 'css-loader',
          // 'less-loader',
          // 'to-string-loader',
          // 'handlebars-loader',
          // 'extract-loader',


          {
            loader: path.resolve(__dirname, 'style_file_loader.js'),
            options: {/* ... */}
          },

          { loader: 'css-loader', options: {
              // modules: true,
              // localsConvention: 'camelCase',
              // localsConvention: 'asIs',
              // sourceMap: true,
              // onlyLocals: true,
              modules: true,
              esModule: false,
              importLoaders: 1,
              // esModule: true,

              // exportOnlyLocals: true,
              // import: true,
              modules: {
                // auto: /\.module\.less$/,
                exportLocalsConvention: 'camelCase',
                exportOnlyLocals: false,
                // mode: 'local'
                // exportGlobals: true,
                // localIdentName: '[path][name]__[local]--[hash:base64:5]',
                localIdentName: '[name]__[local]',
                // localIdentName: '[local]',
                // context: path.resolve(__dirname, 'context'),
                // mode: 'local',
                // exportGlobals: true,
                // localIdentName: '[path][name]__[local]--[hash:base64:5]',
                // context: path.resolve(__dirname, 'src'),
                // hashPrefix: 'my-custom-hash',
              },
            }
          },
          { loader: 'less-loader' },
        ],
        // include: /\.module\.less$/
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
};
