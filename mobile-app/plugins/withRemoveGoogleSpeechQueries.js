const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withRemoveGoogleSpeechQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    if (androidManifest.manifest.queries) {
      androidManifest.manifest.queries = androidManifest.manifest.queries.map((queryBlock) => {
        if (queryBlock.package) {
          queryBlock.package = queryBlock.package.filter(
            (pkg) => pkg.$['android:name'] !== 'com.google.android.googlequicksearchbox'
          );
        }
        return queryBlock;
      });
    }
    return config;
  });
};
