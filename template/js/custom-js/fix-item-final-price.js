export default item => {
  // preset final price
  item.final_price = item.kit_product && item.kit_product.price && item.kit_product.pack_quantity
    // set final price from kit
    ? item.kit_product.price / item.kit_product.pack_quantity
    : item.price
  // fix item final price with customizations additions
  if (Array.isArray(item.customizations)) {
    item.customizations.forEach(customization => {
      if (customization.add_to_price) {
        const { type, addition } = customization.add_to_price
        item.final_price += type === 'fixed'
          ? addition
          : item.price * addition / 100
      }
    })
  }
  if (window.$setProductDomainPrice && !(item.__discounted_price === item.final_price)) {
    const discount = window.$setProductDomainPrice(item)
    if (discount) {
      item.__discounted_price = item.final_price
    }
  }
  return item
}
