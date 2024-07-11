const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.ssr = functions.https.onRequest((req, res) => {
    const path = req.path;
  
    // Check if the path starts with /festpan-
    if (path.startsWith('/festpan-')) {
      // Rewrite /festpan-xxxxxx to /xxxxxx
      req.url = path.replace('/festpan-', '/');
    }
  
    // Call the SSR function
    ssr(req, res);
});