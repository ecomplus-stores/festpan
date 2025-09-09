const path = require('path')

module.exports = () => ({
  resolve: {
    alias: {
      './html/APrices.html': path.resolve(__dirname, 'template/js/components/APrices.html'),
      './js/APrices.js': path.resolve(__dirname, 'template/js/components/APrices.js'),
      './html/TheProduct.html': path.resolve(__dirname, 'template/js/components/TheProduct.html'),
      './js/TheProduct.js': path.resolve(__dirname, 'template/js/components/TheProduct.js'),
      './html/ProductCard.html': path.resolve(__dirname, 'template/js/components/ProductCard.html'),
      './js/ProductCard.js': path.resolve(__dirname, 'template/js/components/ProductCard.js'),
      './html/ProductGallery.html': path.resolve(__dirname, 'template/js/components/ProductGallery.html'),
      './js/DiscountApplier.js': path.resolve(__dirname, 'template/js/components/DiscountApplier.js'),
      './../lib/fix-item-final-price': path.resolve(__dirname, 'template/js/custom-js/fix-item-final-price.js'),

      './html/TheAccount.html': path.resolve(__dirname, 'template/alpix/html/TheAccount.html'),
      './html/RecommendedItems.html': path.resolve(__dirname, 'template/alpix/html/RecommendedItems.html'),
      './js/RecommendedItems.js': path.resolve(__dirname, 'template/alpix/js/RecommendedItems.js'),

      './html/ProductCard.html': path.resolve(__dirname, 'template/alpix/html/ProductCard.html'),
      './html/QuantitySelector.html': path.resolve(__dirname, 'template/alpix/html/QuantitySelector.html'),
      './html/CartQuickview.html': path.resolve(__dirname, 'template/alpix/html/CartQuickview.html'),
      './js/CartQuickview.js': path.resolve(__dirname, 'template/alpix/js/CartQuickview.js'),
      './js/ProductGallery.js': path.resolve(__dirname, 'template/alpix/js/ProductGallery.js'),

       './html/SearchEngine.html': path.resolve(__dirname, 'template/alpix/html/SearchEngine.html'),
       './html/ProductQuickview.html': path.resolve(__dirname, 'template/alpix/html/ProductQuickview.html'),
      './js/SearchEngine.js': path.resolve(__dirname, 'template/alpix/js/SearchEngine.js'),
      './js/ProductCard.js': path.resolve(__dirname, 'template/alpix/js/ProductCard.js'),
      './base-config': path.resolve(__dirname, 'template/js/netlify-cms/base-config'),
    }
  }
})
