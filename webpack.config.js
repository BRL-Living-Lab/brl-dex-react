module.exports = function (webpackEnv) {
    // ...
    return { ...webpackEnv,
     // ...
      resolve: {
        // ...
        fallback: {
          "url": require.resolve("url/"),
          "crypto": require.resolve("crypto-browserify/"),
          "os": require.resolve("os-browserify/browser"), 
          "fs": false,
        }
      }
    }
  }
  