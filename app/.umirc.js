
// ref: https://umijs.org/config/
var path = require('path');

export default {
  history: 'hash',
  "plugins": [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: true,
      title: 'app',
      dll: false,
      pwa: false,
      routes: {
        exclude: [
          /model\.(j|t)sx?$/,
          /service\.(j|t)sx?$/,
          /models\//,
          /components\//,
          /services\//,
        ],
      },

      hardSource: false,
      
    }],
  ],
  "proxy": {
    "/api": {
      "target": "http://10.255.1.23:7777/api",
      "changeOrigin": true,
      "pathRewrite": { "^/api" : "" }
    }
  },
  "sass": {},
  "alias": {
      '@CPC': path.resolve(__dirname, 'src/components/pageComponents/'),
      '@CC':  path.resolve(__dirname, 'src/components/common/'),
      '@CCP':  path.resolve(__dirname, 'src/components/commonPannel/'),
      '@assets': path.resolve(__dirname, 'src/assets/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@layouts': path.resolve(__dirname, 'src/layouts/'),
      '@config': path.resolve(__dirname, 'src/config/')
  },
  "disableCSSModules": true,
  "outputPath": "../../xinyue2/public/testapp",
  "publicPath": "./",
}
