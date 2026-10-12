const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // 开发服务器配置
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },

  // 生产环境配置
  // GitHub Pages 项目站路径为 /campus-app/
  publicPath: process.env.NODE_ENV === 'production' ? '/campus-app/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',

  // 生产环境SourceMap
  productionSourceMap: false,

  // CSS配置
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {},
          javascriptEnabled: true
        }
      }
    }
  },

  // Webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  }
})
