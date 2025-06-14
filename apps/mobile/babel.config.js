export default function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "@babel/preset-typescript"],
    plugins: [],
  };
}
