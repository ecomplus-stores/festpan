import {
  i19asOf,
  i19from,
  i19interestFree,
  i19of,
  i19to,
  i19upTo,
  i19youEarn
} from '@ecomplus/i18n'

import {
  i18n,
  price as getPrice,
  onPromotion as checkOnPromotion,
  formatMoney
} from '@ecomplus/utils'

import waitStorefrontInfo from '@ecomplus/storefront-components/src/js/helpers/wait-storefront-info'

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

const checkDiscountDomain = (product) => {
  const discountRulesDomain = typeof window === 'object' && window.$discountsDomain &&
    window.$discountsDomain.discount_rules

  if (discountRulesDomain && discountRulesDomain.length) {
    const productId = product._id
    const categories = product && product.categories
    let discount
    discountRulesDomain.forEach(rule => {
      let isRuleValid = !rule.product_ids && !rule.excluded_product_ids && !rule.category_ids

      if (rule.product_ids && rule.product_ids.length) {
        isRuleValid = productId && rule.product_ids.includes(productId)
      }

      if (rule.excluded_product_ids && rule.excluded_product_ids.length) {
        isRuleValid = productId && !rule.excluded_product_ids.includes(productId)
      }

      if (rule.category_ids && rule.category_ids.length) {
        const category = categories && categories.length && categories.find(categoryFind => rule.category_ids.includes(categoryFind._id))
        isRuleValid = Boolean(category)
      }

      if (isRuleValid) {
        if (!discount) {
          discount = rule.discount
        }

        if (discount && discount.value < rule.discount.value) {
          discount = rule.discount
        }
      }
    })

    return discount
  }
}

export default {
  name: 'APrices',

  props: {
    product: {
      type: Object,
      required: true
    },
    isLiteral: Boolean,
    isBig: Boolean,
    isAmountTotal: Boolean,
    installmentsOption: Object,
    discountOption: Object,
    discountText: {
      type: [String, Boolean],
      default: ''
    },
    canShowPriceOptions: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      installmentsNumber: 0,
      monthlyInterest: 0,
      discount: {
        type: null,
        value: 0
      },
      extraDiscount: {
        type: null,
        value: 0,
        min_amount: 0
      },
      discountLabel: this.discountText,
      pointsProgramName: null,
      pointsMinPrice: 0,
      earnPointsFactor: 0
    }
  },

  computed: {
    i19asOf: () => i18n(i19asOf),
    i19from: () => i18n(i19from),
    i19interestFree: () => i18n(i19interestFree),
    i19of: () => i18n(i19of),
    i19to: () => i18n(i19to),
    i19upTo: () => i18n(i19upTo),
    i19youEarn: () => i18n(i19youEarn),

    price () {
      const price = getPrice(this.product)
      if (
        this.extraDiscount.value &&
        (!this.extraDiscount.min_amount || price > this.extraDiscount.min_amount)
      ) {
        return getPriceWithDiscount(price, this.extraDiscount)
      }
      return price
    },

    comparePrice () {
      if (checkOnPromotion(this.product)) {
        return this.product.base_price
      } else if (this.extraDiscount.value) {
        return getPrice(this.product)
      }
    },

    hasVariedPrices () {
      const { variations } = this.product
      if (variations) {
        const productPrice = getPrice(this.product)
        for (let i = 0; i < variations.length; i++) {
          const price = getPrice({
            ...this.product,
            ...variations[i]
          })
          if (price > productPrice) {
            return true
          }
        }
      }
      return false
    },

    priceWithDiscount () {
      return this.canShowPriceOptions && getPriceWithDiscount(this.price, this.discount)
    },

    installmentValue () {
      if (this.canShowPriceOptions && this.installmentsNumber >= 2) {
        if (!this.monthlyInterest) {
          return this.price / this.installmentsNumber
        } else {
          const interest = this.monthlyInterest / 100
          return this.price * interest /
            (1 - Math.pow(1 + interest, -this.installmentsNumber))
        }
      }
      return 0
    }
  },

  methods: {
    formatMoney,

    updateInstallments (installments) {
      if (installments) {
        this.monthlyInterest = installments.monthly_interest
        const minInstallment = installments.min_installment || 5
        const installmentsNumber = parseInt(this.price / minInstallment, 10)
        this.installmentsNumber = Math.min(installmentsNumber, installments.max_number)
      }
    },

    updateDiscount (discount) {
      if (
        discount &&
        (!discount.min_amount || discount.min_amount <= this.price) &&
        (!this.isAmountTotal || discount.apply_at === 'total')
      ) {
        this.discount = discount
        if (!this.discountText && this.discountText !== false && discount.label) {
          this.discountLabel = `via ${discount.label}`
        }
      }
    }
  },

  watch: {
    price: {
      handler (price) {
        this.$emit('fix-price', price)
      },
      immediate: true
    }
  },

  created () {
    if (this.canShowPriceOptions) {
      const discountRuleDomain = checkDiscountDomain(this.product || this.item)
      if (discountRuleDomain) {
        this.extraDiscount = discountRuleDomain
      }

      if (this.discountOption) {
        this.updateDiscount(this.discountOption)
      } else {
        waitStorefrontInfo('apply_discount')
          .then(discountCampaign => {
            if (discountCampaign.available_extra_discount) {
              const extraDiscountByCampaign = discountCampaign.available_extra_discount
              const isFixedDiscountByCampaign = extraDiscountByCampaign.type === 'fixed'
              const minAmount = Math.max(extraDiscountByCampaign.min_amount || 1, this.extraDiscount.min_amount || 1)
              if (this.extraDiscount && extraDiscountByCampaign.type !== this.extraDiscount.type) {
                let newValue = isFixedDiscountByCampaign ? this.extraDiscount.value : extraDiscountByCampaign.value
                newValue *= this.price / 100
                newValue += (isFixedDiscountByCampaign ? extraDiscountByCampaign.value : this.extraDiscount.value)
                const value = Math.max(newValue, this.price)
                this.extraDiscount = {
                  type: 'fixed',
                  value,
                  min_amount: minAmount
                }
              } else if (this.extraDiscount && extraDiscountByCampaign.type === this.extraDiscount.type) {
                const newValue = this.extraDiscount.value + extraDiscountByCampaign.value
                const value = isFixedDiscountByCampaign ? Math.max(newValue, this.price) : newValue
                this.extraDiscount = {
                  type: extraDiscountByCampaign.type,
                  value,
                  min_amount: minAmount
                }
              } else {
                this.extraDiscount = extraDiscountByCampaign
              }
            }
          })
      }
      if (this.installmentsOption) {
        this.updateInstallments(this.installmentsOption)
      } else {
        waitStorefrontInfo('list_payments')
          .then(paymentInfo => {
            this.updateInstallments(paymentInfo.installments_option)
            this.updateDiscount(paymentInfo.discount_option)
            const pointsPrograms = paymentInfo.loyalty_points_programs
            if (this.isLiteral && pointsPrograms) {
              this.$nextTick(() => {
                for (const programId in pointsPrograms) {
                  const pointsProgram = pointsPrograms[programId]
                  if (pointsProgram && pointsProgram.earn_percentage > 0) {
                    this.pointsMinPrice = pointsProgram.min_subtotal_to_earn
                    this.pointsProgramName = pointsProgram.name
                    this.earnPointsFactor = pointsProgram.earn_percentage / 100
                    break
                  }
                }
              })
            }
          })
      }
    }
  }
}
