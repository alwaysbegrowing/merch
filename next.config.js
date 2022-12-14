// next.config.js
const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  // optional
  modifyVars: { '@primary-color': '#faad14' },
  // optional
  // optional
  lessVarsFilePathAppendToEndOfContent: false,
  // optional https://github.com/webpack-contrib/css-loader#object
  cssLoaderOptions: {},

  // Other Config Here...

  webpack(config) {
    return config;
  },

  // ONLY for Next.js 10, if you use Next.js 11, delete this block
  future: {
    webpack5: true,
  },
});
