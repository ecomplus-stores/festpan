const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.ssr = functions.https.onRequest((req, res) => {
  if (/^\/[fk]+\/c\//.test(req.path)) {
    const slug = req.path.replace(/^\/[fk]+\/c\//, '')
    res.status(301).set('Location', `/${slug}`).end()
    return
  }
  ssr(req, res);
});
