import * as merge from 'lodash.merge'
import { price as getPrice } from '@ecomplus/utils'
import EcomSearch from '@ecomplus/search-engine'

const storeSpec = 'Festpan'

const fixCategoryIdsFilter = ({ terms }) => {
  if (
    terms &&
    terms['categories.name'] &&
    /^[0-9a-f]{24}$/.test(terms['categories.name'][0])
  ) {
    terms['categories._id'] = terms['categories.name']
    delete terms['categories.name']
  }
}

EcomSearch.dslMiddlewares.push((dsl) => {
  if (dsl.query && dsl.query.bool) {
    if (dsl.query.bool.filter) {
      dsl.query.bool.filter.forEach(fixCategoryIdsFilter)
    }
    if (dsl.query.bool.must) {
      dsl.query.bool.must.forEach((filter) => {
        if (filter.multi_match) {
          const { fields } = filter.multi_match
          if (Array.isArray(fields)) {
            fields.push('skus')
          }
        }
        fixCategoryIdsFilter(filter)
      })
    }
  }
  const storeFilter = {
    nested: {
      path: 'specs',
      query: {
        bool: {
          filter: [{
            term: { 'specs.grid': 'store' }
          }, {
            terms: { 'specs.text': [storeSpec] }
          }]
        }
      }
    }
  }
  const { filter } = (dsl.query && dsl.query.bool) || {}
  if (filter) {
    filter.push(storeFilter)
    return
  }
  merge(dsl, {
    query: {
      bool: { filter: [storeFilter] }
    }
  })
})

const getPriceWithDiscount = (price, discount) => {
  const { type, value } = discount
  let priceWithDiscount
  if (value) {
    if (type === 'percentage') {
      priceWithDiscount = price * (100 - value) / 100
    } else {
      priceWithDiscount = price - value
    }
    return priceWithDiscount > 0 ? priceWithDiscount : 0
  }
}

/*
window.$domainDiscounts = {
  /* eslint-disable *
  "domain": "www.loja.festpan.com.br",
  "discount_rules": [
    {
      "discount": {
        "apply_at": "total",
        "type": "percentage",
        "value": 10
      },
      "cumulative_discount": true,
      "domain": "www.loja.festpan.com.br"
    }
  ],
  "product_kit_discounts": [],
  "freebies_rules": []
  /* eslint-enable *
}
*/

window.$setProductDomainPrice = (product) => {
  if (!window.$domainDiscounts) return null
  const { discount_rules: discountRules } = window.$domainDiscounts
  if (!discountRules || !discountRules.length) {
    return null
  }
  const productId = product.product_id || product._id
  let discount = null
  discountRules.forEach(rule => {
    if (rule.product_ids && rule.product_ids.length) {
      if (!rule.product_ids.includes(productId)) return
    }
    if (rule.excluded_product_ids && rule.excluded_product_ids.length) {
      if (rule.excluded_product_ids.includes(productId)) return
    }
    if (rule.category_ids && rule.category_ids.length) {
      if (
        !product.categories ||
        !product.categories.find(({ _id }) => rule.category_ids.includes(_id))
      ) {
        return
      }
    }
    if (rule.discount.min_amount > getPrice(product)) {
      return
    }
    if (!discount || discount.value < rule.discount.value) {
      discount = rule.discount
    }
  })
  if (discount) {
    ;['price', 'base_price', 'final_price'].forEach((field) => {
      if (product[field]) {
        product[field] = getPriceWithDiscount(product[field], discount)
      }
    })
  }
  return discount
}
