const functions = require('firebase-functions')

const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'false'

exports.ssr = functions.https.onRequest((req, res) => {
  const chChar = 'p'
  if (
    req.path.length > 1
    && !req.path.startsWith('/app/')
    && !req.path.startsWith('/admin/')
    && !req.path.startsWith('/search')
    && !req.path.startsWith('/blog')
    && !req.path.startsWith('/posts/')
    && !req.path.startsWith('/pages/')
    && !req.path.startsWith('/404')
  ) {
    const paths = req.path.split('/').slice(1)
    if (paths.length < 2) {
      res
        .status(301)
        .set('Location', `/${chChar}${req.path}`)
        .end()
      return
    }
    const [chsPath] = paths
    if (!chsPath.includes(chChar)) {
      res
        .status(301)
        .set('Location', req.path.replace(`/${chsPath}/`, `/${chChar}/`))
        .end()
      return
    }
  }
  ssr(req, res);
});
