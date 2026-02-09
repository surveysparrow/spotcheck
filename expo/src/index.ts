// Reexport the native module. On web, it will be resolved to SpotchecksModule.web.ts
// and on native platforms to SpotchecksModule.ts
export { default } from './SpotchecksModule';
export { default as SpotchecksView } from './SpotchecksView';
export * from  './Spotchecks.types';
