const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.ssr = functions.https.onRequest((req, res) => {

    if (!req.path.startsWith('/fastpan-')) {
      req.url = req.url.replace(req.path, `/fastpan-${req.path.substring(1)}`)
    }}
  
    // Call the SSR function
    ssr(req, res);
});