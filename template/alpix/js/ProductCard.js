import {
  i19addToFavorites,
  i19buy,
  i19connectionErrorProductMsg,
  i19outOfStock,
  i19unavailable
} from '@ecomplus/i18n'

import {
  i18n,
  name as getName,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
  price as getPrice
} from '@ecomplus/utils'

import Vue from 'vue'
import { store } from '@ecomplus/client'
import ecomCart from '@ecomplus/shopping-cart'
import ALink from '@ecomplus/storefront-components/src/ALink.vue'
import APicture from '@ecomplus/storefront-components/src/APicture.vue'
import APrices from '@ecomplus/storefront-components/src/APrices.vue'
import ecomPassport from '@ecomplus/passport-client'
import { toggleFavorite, checkFavorite } from '@ecomplus/storefront-components/src/js/helpers/favorite-products'

const getExternalHtml = (varName, product) => {
  if (typeof window === 'object') {
    varName = `productCard${varName}Html`
    const html = typeof window[varName] === 'function'
      ? window[varName](product)
      : window[varName]
    if (typeof html === 'string') {
      return html
    }
  }
  return undefined
}

export default {
  name: 'ProductCard',

  components: {
    ALink,
    APicture,
    APrices
  },

  props: {
    grid:{
      type: String,
      default: 'col-md-4'
    },
    product: Object,
    productId: String,
    isSmall: Boolean,
    blockType:{
      type: String,
      default: 'card'
    },
    headingTag: {
      type: String,
      default: 'h3'
    },
    buyText: String,
    transitionClass: {
      type: String,
      default: 'animated fadeIn'
    },
    canAddToCart: {
      type: Boolean,
      default: true
    },
    ecomPassport: {
      type: Object,
      default () {
        return ecomPassport
      }
    },
    accountUrl: {
      type: String,
      default: '/app/#/account/'
    },
    isLoaded: Boolean,
    installmentsOption: Object,
    discountOption: Object
  },

  data () {
    return {
      body: {},
      isLoading: false,
      isWaitingBuy: false,
      isHovered: false,
      isFavorite: false,
      error: '',
      localType: this.blockType,
      quickViewRunning: false,
    }
  },

  computed: {
    i19addToFavorites: () => i18n(i19addToFavorites),
    i19outOfStock: () => i18n(i19outOfStock),
    i19unavailable: () => i18n(i19unavailable),
    i19uponRequest: () => 'Sob consulta',

    isWithoutPrice () {
      return !getPrice(this.body)
    },

    ratingHtml () {
      return getExternalHtml('Rating', this.body)
    },

    buyHtml () {
      return getExternalHtml('Buy', this.body)
    },

    footerHtml () {
      return getExternalHtml('Footer', this.body)
    },

    name () {
      return getName(this.body)
    },

    strBuy () {
      return this.buyText ||
        (typeof window === 'object' && window.productCardBuyText) ||
        i18n(i19buy)
    },

    isInStock () {
      return checkInStock(this.body)
    },

    isActive () {
      return this.body.available && this.body.visible && this.isInStock
    },

    isLogged () {
      return ecomPassport.checkAuthorization()
    },

    discount () {
      const { body } = this
      return checkOnPromotion(body)
        ? Math.round(((body.base_price - getPrice(body)) * 100) / body.base_price)
        : 0
    },
    shortShelfLife () {
      let date
      if (this.body.specs) {
        const spec = this.body.specs.find(({ grid }) => grid === 'validade')
        if (spec && spec.text) {
          date = new Date(spec.text)
        }
      }
      if (!date) {
        const { specifications } = this.body
        const dateStr = specifications && specifications.validade &&
          specifications.validade[0] && specifications.validade[0].text
        if (dateStr) {
          date = new Date(dateStr)
        }
      }
      if (date) {
        const now = Date.now()
        const dateTimestamp = date.getTime()
        if (
          dateTimestamp > now - 1000 * 60 * 60 * 24 * 60 &&
          dateTimestamp < now + 1000 * 60 * 60 * 24 * 180
        ) {
          return date.toLocaleDateString()
        }
      }
      return null
    }
  },

  methods: {
    setBody (data) {
      this.body = Object.assign({}, data)
      delete this.body.body_html
      delete this.body.body_text
      delete this.body.inventory_records
      delete this.body.price_change_records
      this.isFavorite = checkFavorite(this.body._id, this.ecomPassport)
    },

    fetchItem () {
      if (this.productId) {
        this.isLoading = true
        store({ url: `/products/${this.productId}.json` })
          .then(({ data }) => {
            this.$emit('update:product', data)
            this.setBody(data)
            this.$emit('update:is-loaded', true)
          })
          .catch(err => {
            console.error(err)
            if (!this.body.name || !this.body.slug || !this.body.pictures) {
              this.error = i18n(i19connectionErrorProductMsg)
            }
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },

    async toggleFavorite () {
      if (this.isLogged) {
        this.isFavorite = await toggleFavorite(this.body._id, this.ecomPassport)
           setTimeout(() => {        
        window.updateClientInfo();
      }, 1000);
      }
    },
    quickView(){
      const product = this.body
      if(this.quickViewRunning){
        return
      }
      this.quickViewRunning = true
      store({ url: `/products/${product._id}.json` })
          .then(({ data }) => {
            const selectFields = ['variations', 'customizations', 'kit_composition']
            for (let i = 0; i < selectFields.length; i++) {
              const selectOptions = data[selectFields[i]]
              //if (selectOptions && selectOptions.length) {
                return import('@ecomplus/storefront-components/src/ProductQuickview.vue')
                  .then(quickview => {
                    new Vue({
                      render: h => h(quickview.default, {
                        props: {
                          product: data
                        }
                      })
                    }).$mount(this.$refs.quickview)
                  })
              //}
            }
           
          }) 
          .catch(err => {
            console.error(err)
            window.location = `/${product.slug}`
            this.quickViewRunning = false
          })
          .finally(() => {
            this.isWaitingBuy = false
            this.quickViewRunning = false
          })
    },
    buy () {
      const product = this.body
      this.$emit('buy', { product })
      if (this.canAddToCart && !this.isWaitingBuy) {
        this.isWaitingBuy = true
        store({ url: `/products/${product._id}.json` })
          .then(({ data }) => {
            const selectFields = ['variations', 'customizations', 'kit_composition']
            for (let i = 0; i < selectFields.length; i++) {
              
              const selectOptions = data[selectFields[i]]
              if (selectOptions && selectOptions.length) {
                return import('@ecomplus/storefront-components/src/ProductQuickview.vue')
                  .then(quickview => {
                    new Vue({
                      render: h => h(quickview.default, {
                        props: {
                          product: data
                        }
                      })
                    }).$mount(this.$refs.quickview)
                  })
              }
            }
            const { quantity, price } = data
            console.log('buy', data)
            ecomCart.addProduct({ ...product, quantity, price })
          })
          .catch(err => {
            console.error(err)
            window.location = `/${product.slug}`
          })
          .finally(() => {
            this.isWaitingBuy = false
          })
      }
    },
    // refreshFavorite() {
    //   console.log('refreshFavorite')
    //   this.isFavorite = checkFavorite(this.body._id, this.ecomPassport)
    //   setTimeout(() => {        
    //     window.updateClientInfo();
    //   }, 1000);
    // },
  },
  mounted(){
    if (this.$el && this.$el.dataset) {
      // Override props with data attributes if available
      if (this.$el.dataset.blockType) {
        this.localType = this.$el.dataset.blockType;        
      }
    }
    
    // Adicionar event listeners para detectar hover
    if (this.$el) {
      this.$el.addEventListener('mouseenter', this.refreshFavorite);      
    }
    this.$nextTick(() => {
      setTimeout(() => {
        window.equalProductNameSize();
      }, 1000);
      
    });
    //window.equalProductNameSize();
  

  },
  created () {
    if (this.product) {
      this.setBody(this.product)
      if (this.product.available === undefined) {
        this.body.available = true
      }
      if (this.product.visible === undefined) {
        this.body.visible = true
      }
    }
    if (!this.isLoaded) {
      this.fetchItem()
    }
  }
}