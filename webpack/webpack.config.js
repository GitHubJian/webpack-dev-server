module.exports = {
  mode: 'production',
  context: '/Users/apple/Documents/workspace/webpack-dev-server',
  devtool: 'source-map',
  node: {
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  output: {
    path: '/Users/apple/Documents/workspace/webpack-dev-server/dist',
    filename: 'js/[name]-legacy.[contenthash:8].js',
    publicPath: '/',
    chunkFilename: 'js/[name]-legacy.[contenthash:8].js'
  },
  resolve: {
    alias: {
      '@': '/Users/apple/Documents/workspace/webpack-dev-server/src',
      vue$: 'vue/dist/vue.runtime.esm.js'
    },
    extensions: ['.mjs', '.js', '.jsx', '.vue', '.json'],
    modules: [
      'node_modules',
      '/Users/apple/Documents/workspace/webpack-dev-server/node_modules',
      '/Users/apple/Documents/workspace/webpack-dev-server/cli-service/node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      'node_modules',
      '/Users/apple/Documents/workspace/webpack-dev-server/node_modules',
      '/Users/apple/Documents/workspace/webpack-dev-server/cli-service/node_modules'
    ]
  },
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            options: {
              cacheDirectory:
                '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/.cache/vue-loader',
              cacheIdentifier: '13619386'
            }
          },
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false
              },
              cacheDirectory:
                '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/.cache/vue-loader',
              cacheIdentifier: '13619386'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              }
            ]
          },
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              }
            ]
          },
          {
            test: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              }
            ]
          },
          {
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              }
            ]
          }
        ]
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false
                }
              }
            ]
          },
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false
                }
              }
            ]
          },
          {
            test: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false
                }
              }
            ]
          },
          {
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false
                }
              }
            ]
          }
        ]
      },
      {
        test: /\.sass$/,
        oneOf: [
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false,
                  indentedSyntax: true
                }
              }
            ]
          },
          {
            resourceQuery: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false,
                  indentedSyntax: true
                }
              }
            ]
          },
          {
            test: {},
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false,
                  indentedSyntax: true
                }
              }
            ]
          },
          {
            use: [
              {
                loader:
                  '/Users/apple/Documents/workspace/webpack-dev-server/node_modules/mini-css-extract-plugin/dist/loader.js',
                options: {
                  publicPath: '../'
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: false,
                  importLoaders: 1
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: false,
                  indentedSyntax: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      {
        options: {
          test: {},
          extractComments: false,
          sourceMap: true,
          cache: true,
          parallel: true,
          terserOptions: {
            output: {
              comments: {}
            },
            compress: {
              arrows: false,
              collapse_vars: false,
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,
              booleans: true,
              if_return: true,
              sequences: true,
              unused: true,
              conditionals: true,
              dead_code: true,
              evaluate: true
            },
            mangle: {
              safari10: true
            }
          }
        }
      }
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: {},
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    {},
    {
      definitions: {
        'process.env': {
          NODE_ENV: "'production'",
          BASE_URL: '' / ''
        }
      }
    },
    {
      options: {},
      pathCache: {},
      fsOperations: 0,
      primed: false
    },
    {
      compilationSuccessInfo: {},
      shouldClearConsole: true,
      formatters: [null, null, null, null],
      transformers: [null, null, null, null],
      previousEndTimes: {}
    },
    {
      options: {
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css'
      }
    },
    {
      options: {
        sourceMap: false,
        cssnanoOptions: {
          preset: [
            'default',
            {
              mergeLonghand: false,
              cssDeclarationSorter: false
            }
          ]
        }
      }
    },
    {
      options: {
        context: null,
        hashFunction: 'md4',
        hashDigest: 'hex',
        hashDigestLength: 4
      }
    },
    {
      options: {
        template:
          '/Users/apple/Documents/workspace/webpack-dev-server/cli-service/lib/config/index-default.html',
        filename: 'index.html',
        hash: false,
        inject: true,
        compile: true,
        favicon: false,
        minify: false,
        cache: true,
        showErrors: true,
        chunks: 'all',
        excludeChunks: [],
        chunksSortMode: 'auto',
        meta: {},
        title: 'Webpack App',
        xhtml: false
      }
    }
  ],
  entry: {
    app: '/Users/apple/Documents/workspace/webpack-dev-server/src/App.vue'
  }
}
