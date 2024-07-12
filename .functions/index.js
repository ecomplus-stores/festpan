const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.ssr = functions.https.onRequest((req, res) => {
  if (
    req.path.length > 1
    && !req.path.startsWith('/fastpan-')
    && !req.path.startsWith('/app/')
    && !req.path.startsWith('/admin/')
    && !req.path.startsWith('/blog')
    && !req.path.startsWith('/404')
  ) {
    req.url = req.url.replace(req.path, `/fastpan-${req.path.substring(1)}`)
  }
  ssr(req, res);
});
