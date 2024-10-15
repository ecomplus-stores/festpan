const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const axios = require('axios')
const { ssr } = require('@ecomplus/storefront-renderer/functions/')

process.env.STOREFRONT_LONG_CACHE = 'false'

initializeApp()

axios.$ssrFetchAndCache = async (
  url,
  {
    maxAge = 300,
    canUseStale = true,
    cacheKey,
    timeout = 4000
  } = {}
) => {
  const key = cacheKey || `${url}`.replace(/\//g, '$').substring(0, 1499)
  const now = Date.now()
  const ttlMs = maxAge * 1000
  const docRef = getFirestore().doc(`ssrFetchCache/${key}`)
  const docSnap = await docRef.get()
  const runFetch = async () => {
    const response = await axios.get(url, { timeout })
    const { data } = response
    const cacheVal = { timestamp: now, data }
    docRef.set(cacheVal)
    return data
  }
  if (docSnap.exists) {
    const cacheVal = docSnap.data()
    if (cacheVal.timestamp + ttlMs >= now) {
      return cacheVal.data
    }
    if (canUseStale) {
      runFetch().catch(console.error)
      return cacheVal.data
    }
  }
  return runFetch()
}

globalThis.ecomClientAxiosMidd = async (config) => {
  if (config.method && config.method !== 'get') return null
  if (config.headers?.['X-Access-Token']) return null
  if (!config.baseURL?.includes('ecvol.com')) return null
  let url = config.baseURL
  if (url.endsWith('/')) {
    if (config.url.startsWith('/')) {
      url += config.url.substring(1)
    } else {
      url += config.url
    }
  } else {
    if (config.url.startsWith('/')) {
      url += config.url
    } else {
      url += `/${config.url}`
    }
  }
  const data = await axios.$ssrFetchAndCache(url)
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

exports.ssr = functions.https.onRequest((req, res) => {
  const chChar = 'p'
  if (
    req.path.length > 1 &&
    !req.path.startsWith('/app/') &&
    !req.path.startsWith('/admin/') &&
    !req.path.startsWith('/search') &&
    !req.path.startsWith('/blog') &&
    !req.path.startsWith('/posts/') &&
    !req.path.startsWith('/pages/') &&
    !req.path.startsWith('/404')
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
  ssr(req, res)
})
