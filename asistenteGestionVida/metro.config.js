const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = defaultConfig.resolver;

return {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    // 1. Agregamos 'wasm' y 'db' a los ACTIVOS (Assets)
    assetExts: [...assetExts, 'wasm', 'db'],
    
    // 2. IMPORTANTE: Aseguramos que 'wasm' NO esté en las FUENTES (SourceExts)
    sourceExts: sourceExts.filter((ext) => ext !== 'wasm'),
  },
};