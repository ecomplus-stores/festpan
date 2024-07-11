const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.rewriteAndSSR = functions.https.onRequest((req, res) => {
  let path = req.path;

  // Check if the path starts with /festpan-
  if (path.startsWith('/festpan-')) {
    // Rewrite /festpan-xxxxxx to /xxxxxx
    req.url = path.replace('/festpan-', '/');
  }

  // Forward the request to the SSR function
  ssr(req, res);
});