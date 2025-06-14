import {getDefaultConfig} from "expo/metro-config";
import {fileURLToPath} from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getDefaultConfig(__dirname);

// Disable Expo Router completely
config.resolver.platforms = ["ios", "android", "web"];

// Override the default entry point resolution to use index.ts instead of app directory
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
config.resolver.assetExts = [...config.resolver.assetExts, "bin"];

export default config;