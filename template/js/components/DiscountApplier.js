import {
  i19add,
  i19addDiscountCoupon,
  // i19add$1ToGetDiscountMsg,
  i19campaignAppliedMsg,
  i19code,
  i19couponAppliedMsg,
  i19discountCoupon,
  i19errorMsg,
  i19hasCouponOrVoucherQn,
  i19invalidCouponMsg
} from '@ecomplus/i18n'

import { i18n, formatMoney } from '@ecomplus/utils'
import { store, modules } from '@ecomplus/client'
import ecomCart from '@ecomplus/shopping-cart'
import ecomPassport from '@ecomplus/passport-client'
import AAlert from '@ecomplus/storefront-components/src/AAlert.vue'

const addFreebieItems = (ecomCart, productIds) => {
  if (Array.isArray(productIds)) {
    ecomCart.data.items.forEach(({ _id, product_id: productId, flags }) => {
      if (flags && flags.includes('freebie') && !productIds.includes(productId)) {
        ecomCart.removeItem(_id)
      }
    })
    productIds.forEach(productId => {
      const canAddFreebie = !ecomCart.data.items.find(item => {
        return item.product_id === productId && item.flags && item.flags.includes('freebie')
      })
      if (canAddFreebie) {
        store({ url: `/products/${productId}.json` })
          .then(({ data }) => {
            if (data.quantity > 0 && (!data.variations || !data.variations.length)) {
              ecomCart.addProduct(
                {
                  ...data,
                  flags: ['freebie', '__tmp']
                },
                null,
                productIds.reduce((qnt, _id) => {
                  return _id === productId ? qnt + 1 : qnt
                }, 0)
              )
            }
          })
          .catch(console.error)
      }
    })
  } else {
    if (ecomCart.data && ecomCart.data.items && ecomCart.data.items.length) {
      ecomCart.data.items.forEach(({ _id, flags }) => {
        if (flags && flags.includes('freebie')) {
          ecomCart.removeItem(_id)
        }
      })
    }
  }
}

export default {
  name: 'DiscountApplier',

  components: {
    AAlert
  },

  props: {
    amount: Object,
    couponCode: String,
    hasCouponInput: {
      type: Boolean,
      default: true
    },
    isFormAlwaysVisible: Boolean,
    isCouponApplied: Boolean,
    isAttentionWanted: Boolean,
    canAddFreebieItems: {
      type: Boolean,
      default: true
    },
    modulesPayload: Object,
    paymentGateway: Object,
    ecomCart: {
      type: Object,
      default () {
        return ecomCart
      }
    },
    customer: Object,
    canPassManyDiscountApps: Boolean,
    ecomPassport: {
      type: Object,
      default () {
        return ecomPassport
      }
    }
  },

  data () {
    return {
      alertText: null,
      alertVariant: null,
      isFormVisible: this.isFormAlwaysVisible || this.couponCode,
      isLoading: false,
      localCouponCode: this.couponCode,
      localAmountTotal: null,
      isUpdateSheduled: false
    }
  },

  computed: {
    i19add$1ToGetDiscountMsg: () => i18n({
      en_us: 'Add more $1 to cart to get the discount.',
      pt_br: 'Adicione mais $1 ao carrinho para ganhar o desconto.'
    }),
    i19add: () => i18n(i19add),
    i19addDiscountCoupon: () => i18n(i19addDiscountCoupon),
    i19code: () => i18n(i19code),
    i19couponAppliedMsg: () => i18n(i19couponAppliedMsg),
    i19discountCoupon: () => i18n(i19discountCoupon),
    i19hasCouponOrVoucherQn: () => i18n(i19hasCouponOrVoucherQn),
    i19invalidCouponMsg: () => i18n(i19invalidCouponMsg),
    i19campaignAppliedMsg: () => i18n(i19campaignAppliedMsg),

    canAddCoupon () {
      return !this.couponCode || !this.isCouponApplied ||
        this.couponCode !== this.localCouponCode
    },

    paymentGatewayDiscount () {
      if (!this.paymentGateway) return 0
      const { discount } = this.paymentGateway
      if (!discount || !discount.value) return 0
      const applyAt = discount.apply_at || 'total'
      const maxDiscount = applyAt === 'total' ? this.localAmountTotal : this.amount[applyAt]
      if (maxDiscount > 0) {
        const { type, value } = discount
        if (type === 'percentage') {
          return maxDiscount * value / 100
        }
        return value <= maxDiscount ? value : maxDiscount
      }
      return 0
    }
  },

  methods: {
    fixAmount () {
      const amount = this.amount || {
        subtotal: this.ecomCart.data.subtotal
      }
      this.localAmountTotal = Math.round(((amount.subtotal || 0) +
        (amount.freight || 0) - this.paymentGatewayDiscount) * 100) / 100
    },

    parseDiscountOptions (listResult = []) {
      let extraDiscountValue = 0
      let hasFreebies = false
      if (listResult.length) {
        let discountRule, invalidCouponMsg, invalidAlertVariant
        listResult.forEach(appResult => {
          const { validated, error, response } = appResult
          if (validated && !error) {
            const appDiscountRule = response.discount_rule
            if (appDiscountRule) {
              if (!this.canPassManyDiscountApps) {
                const discountRuleValue = appDiscountRule.extra_discount.value
                if (!(extraDiscountValue > discountRuleValue)) {
                  extraDiscountValue = discountRuleValue
                  discountRule = {
                    app_id: appResult.app_id,
                    ...appDiscountRule
                  }
                }
              } else {
                if (extraDiscountValue) {
                  appDiscountRule.extra_discount.value += extraDiscountValue
                  discountRule = appDiscountRule
                } else {
                  discountRule = {
                    app_id: appResult.app_id,
                    ...appDiscountRule
                  }
                }
                extraDiscountValue = appDiscountRule.extra_discount.value
              }
            } else if (response.available_extra_discount && response.available_extra_discount.min_amount) {
              invalidCouponMsg = this.i19add$1ToGetDiscountMsg
                .replace('$1', formatMoney(response.available_extra_discount.min_amount - this.amount.subtotal))
              invalidAlertVariant = 'info'
            }
            if (response.invalid_coupon_message) {
              invalidCouponMsg = response.invalid_coupon_message
            }
            if (this.canAddFreebieItems) {
              const freebieProductIds = response.freebie_product_ids
              if (Array.isArray(freebieProductIds) && freebieProductIds.length) {
                hasFreebies = true
                addFreebieItems(this.ecomCart, freebieProductIds)
                if (this.localCouponCode) {
                  this.$emit('update:coupon-code', this.localCouponCode)
                }
              }
            }
          }
        })
        if (extraDiscountValue) {
          if (this.localCouponCode) {
            if (invalidCouponMsg) {
              this.alertText = invalidCouponMsg
              this.alertVariant = invalidAlertVariant || 'warning'
            } else {
              this.$emit('update:coupon-code', this.localCouponCode)
              this.alertText = this.i19couponAppliedMsg
              this.alertVariant = 'info'
            }
          } else {
            this.alertText = this.i19campaignAppliedMsg
            this.alertVariant = 'info'
          }
          this.$emit('set-discount-rule', discountRule)
        } else {
          if (this.localCouponCode && !hasFreebies) {
            this.alertText = invalidCouponMsg || this.i19invalidCouponMsg
            this.alertVariant = invalidAlertVariant || 'warning'
          } else {
            this.alertText = null
          }
          this.$emit('set-discount-rule', {})
        }
      }
    },

    fetchDiscountOptions (data = {}) {
      this.isLoading = true
      const customer = this.customer || this.ecomPassport.getCustomer()
      if (customer && (customer._id || customer.doc_number)) {
        data.customer = {}
        if (customer._id) {
          data.customer._id = customer._id
        }
        if (customer.display_name) {
          data.customer.display_name = customer.display_name
        }
        if (customer.doc_number) {
          data.customer.doc_number = customer.doc_number
        }
      }
      const body = {
        ...this.modulesPayload,
        amount: {
          subtotal: this.localAmountTotal,
          ...this.amount,
          total: this.localAmountTotal,
          discount: this.paymentGatewayDiscount
        },
        items: this.ecomCart.data.items,
        ...data
      }
      if (body.domain) body.domain += '.skip-open'
      modules({
        url: '/apply_discount.json',
        method: 'POST',
        data: body
      })
        .then(({ data }) => this.parseDiscountOptions(data.result))
        .catch(err => {
          console.error(err)
          this.alertVariant = 'danger'
          this.alertText = i18n(i19errorMsg)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    submitCoupon (isForceUpdate) {
      if (isForceUpdate || this.canAddCoupon) {
        const { localCouponCode } = this
        const data = {
          discount_coupon: localCouponCode
        }
        this.fetchDiscountOptions(data)
      }
    },

    updateDiscount (isForceUpdate = true) {
      if (this.couponCode) {
        if (isForceUpdate || !this.isCouponApplied) {
          this.submitCoupon(isForceUpdate)
        }
      } else if (
        isForceUpdate ||
        (!this.isUpdateSheduled && this.amount && this.localAmountTotal)
      ) {
        this.fetchDiscountOptions()
      }
    },

    scheduleUpdateDiscount () {
      if (this.isUpdateSheduled) return
      this.isUpdateSheduled = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateDiscount()
          this.isUpdateSheduled = false
        }, 600)
      })
    }
  },

  watch: {
    couponCode (couponCode) {
      if (couponCode !== this.localCouponCode) {
        this.localCouponCode = couponCode
        if (couponCode && !this.isFormVisible) {
          this.isFormVisible = true
        }
      }
    },

    localCouponCode () {
      if (this.alertVariant === 'info') {
        this.alertText = null
      }
    },

    isFormAlwaysVisible (isFormVisible) {
      if (isFormVisible) {
        this.isFormVisible = true
      }
    },

    isFormVisible (isFormVisible) {
      if (isFormVisible) {
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      }
    },

    localAmountTotal (total, oldTotal) {
      if (oldTotal !== null && Math.abs(total - oldTotal) > 0.02) {
        this.scheduleUpdateDiscount()
      }
    },

    amount: {
      handler () {
        this.fixAmount()
      },
      deep: true
    },

    paymentGatewayDiscount () {
      this.scheduleUpdateDiscount()
    }
  },

  mounted () {
    this.fixAmount()
    this.updateDiscount(false)
  }
}
