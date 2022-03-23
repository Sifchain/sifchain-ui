const fs = require("fs").promises;
const path = require("path");
const { compileTemplate } = require("@vue/compiler-sfc");
const babel = require("@babel/core");
const jsx = require("@vue/babel-plugin-jsx");
const { optimize: optimizeSvg } = require("svgo");

module.exports = function svgLoader(options = {}) {
  const { svgoConfig, svgo } = options;

  const svgRegex = /\.svg(\?(raw|url|component))?$/;

  return {
    name: "svg-loader",
    enforce: "pre",

    resolveid(id) {
      return id.match(svgRegex) ? id : null;
    },

    async load(id) {
      if (!id.match(svgRegex)) {
        return;
      }

      const [path, query] = id.split("?", 2);

      if (query === "url") {
        return path;
      } else if (query === "raw") {
        return await fs.readFile(path, "utf-8");
      }
    },

    async transform(src, id) {
      if (!id.match(svgRegex)) {
        return;
      }

      const doNotCompile = id.includes("/public/");
      if (doNotCompile) return;

      const [path, query] = id.split("?", 2);

      if (query === "component" || query === undefined) {
        let svg = await fs.readFile(path, "utf-8");

        const data = optimizeSvg(svg, {
          path,
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIDs: false,
                },
              },
            },
          ],
          ...svgoConfig,
        });
        svg = data.data;

        const result = babel.transformSync(
          `function render (props) { ` +
            `return ${svg.replace(">", "{...props}>")};` +
            `}`,
          {
            babelrc: false,
            plugins: [jsx],
            sourceMaps: false,
            sourceFileName: id,
            configFile: false,
            ast: false,
          },
        );

        return `${result.code}\nexport default render`;
      }

      return `export default ${JSON.stringify(src)}`;
    },
  };
};
