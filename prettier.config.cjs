/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  // @ts-expect-error no types
  ...require("@albizures/prettier-config"),
};

module.exports = config;
