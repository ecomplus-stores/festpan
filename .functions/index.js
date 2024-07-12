const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'true'

exports.ssr = functions.https.onRequest((req, res) => {
  if (/^\/[fk]+\/c\//.test(req.path)) {
    res
      .status(301)
      .set('Location', req.path.replace(/^\/[fk]+\//, '/'))
      .end()
    return
  }
  ssr(req, res);
});
