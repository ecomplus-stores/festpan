const path = require('path')

module.exports = () => ({
  resolve: {
    alias: {
      './html/APrices.html': path.resolve(__dirname, 'template/js/components/APrices.html'),
      './js/APrices.js': path.resolve(__dirname, 'template/js/components/APrices.js'),
      './html/TheProduct.html': path.resolve(__dirname, 'template/js/components/TheProduct.html'),
      './js/DiscountApplier.js': path.resolve(__dirname, 'template/js/components/DiscountApplier.js')
    }
  }
})
