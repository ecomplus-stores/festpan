import EcomSearch from '@ecomplus/search-engine'
import waitStorefrontInfo from '@ecomplus/storefront-components/src/js/helpers/wait-storefront-info'

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

const getDiscountByDomain = async () => {
  const domain = typeof window === 'object' && window._settings && window._settings.domain
  const storeId = typeof window === 'object' && window._settings && window._settings.store_id
  const urlAppDiscount = 'https://us-central1-ecom-discounts2.cloudfunctions.net/app'
  const discountByDomain = await fetch(`${urlAppDiscount}/discount-rules?store_id=${storeId}&domain=${domain}`)

  window.$discountsDomain = await discountByDomain.json()
}

getDiscountByDomain()
