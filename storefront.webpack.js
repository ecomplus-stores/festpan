const path = require('path')
const dirSearchAlias = path.resolve(__dirname, 'template/js/lib/search-engine')
const pathDslAlias = path.resolve(dirSearchAlias, 'dsl')

module.exports = () => ({
  resolve: {
    alias: {
      './methods/set-search-term': path.resolve(dirSearchAlias, 'set-search-term'),
      './html/APrices.html': path.resolve(__dirname, 'template/js/components/APrices.html'),   
      './js/APrices.js': path.resolve(__dirname, 'template/js/components/APrices.js')
    }
  }
})
