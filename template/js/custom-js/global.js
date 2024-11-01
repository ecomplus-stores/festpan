import { price as getPrice } from '@ecomplus/utils'
import EcomSearch from '@ecomplus/search-engine'

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

const holidays = [
  // https://brasilapi.com.br/api/feriados/v1/2024
  '2024-11-02',
  '2024-11-15',
  '2024-11-20',
  '2024-12-25',
  '2024-12-31',
  '2025-01-01'
]
const getDateStr = (d) => {
  return `${d.getFullYear()}-` +
    `${(d.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${d.getDate().toString().padStart(2, '0')}`
}
const checkHoliday = (d) => {
  const weekDay = d.getDay()
  if (weekDay === 0 || weekDay === 6) return true
  const dateStr = getDateStr(d)
  return holidays.some((_dateStr) => _dateStr === dateStr)
}
window.propsShippingLine = {
  getDeadlineStr ({ days, isWorkingDays }) {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    if (days === 1 && isWorkingDays && checkHoliday(date)) {
      return 'Em 1 dia útil'
    }
  }
}
