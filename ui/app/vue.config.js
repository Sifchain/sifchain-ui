module.exports = {
  publicPath: "./",
  lintOnSave: false,
  devServer: {
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  configureWebpack: {
    devtool: "source-map",
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Sifchain";
      return args;
    });

    const svgRule = config.module.rule("svg");
    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear();
    svgRule
      .use("vue-loader")
      .loader("vue-loader") // or `vue-loader-v16` if you are using a preview support of Vue 3 in Vue CLI
      .end();
    // add replacement loader(s)
    svgRule
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .options({
        svgo: {
          plugins: [{ removeDimensions: true }, { removeViewBox: false }],
        },
      });
  },
  css: {
    extract: {
      filename: "app.css",
    },
    loaderOptions: {
      sass: {
        additionalData: `
            @import "@/scss/typography.scss";
            @import "@/scss/variables.scss";
            @import "@/scss/mixins.scss";
          `,
      },
    },
  },
};
