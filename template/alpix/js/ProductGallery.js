import {
  i19addToCart,
  i19close,
  i19fullscreen,
  i19openGallery,
  i19next,
  i19previous,
  i19share,
  i19shareOnFacebook,
  i19video
} from '@ecomplus/i18n'

import {
  i18n,
  name as getName,
  img as getImg
} from '@ecomplus/utils'

import ecomCart from '@ecomplus/shopping-cart'
import Glide from '@glidejs/glide'
import APicture from '@ecomplus/storefront-components/src/APicture.vue'
import PhotoSwipeLightbox from "./photoswipe-lightbox.esm.min.js";

export default {
  name: 'ProductGallery',

  components: {
    APicture
  },

  props: {
    product: {
      type: Object,
      default () {
        return {
          pictures: [],
          videos: []
        }
      }
    },
    isQuickview: {
      type: Boolean,
      default: false
    },
    pictures: Array,
    video: Object,
    videoAspectRatio: {
      type: String,
      default: '16by9'
    },
    canAddToCart: {
      type: Boolean,
      default: true
    },
    currentSlide: {
      type: Number,
      default: 1
    },
    glideOptions: {
      type: Object,
      default () {
        return {
          type: 'slider',
          autoplay: false,
          rewind: false
        }
      }
    },
    isSSR: Boolean
  },

  data () {
    return {
      glide: null,
      pswp: null,
      activeIndex: null,
      isSliderMoved: false,
      elFirstPicture: null,
      zoomLinkStyle: null
    }
  },

  computed: {
    i19addToCart: () => i18n(i19addToCart),
    i19close: () => i18n(i19close),
    i19fullscreen: () => i18n(i19fullscreen),
    i19next: () => i18n(i19next),
    i19previous: () => i18n(i19previous),
    i19openGallery: () => i18n(i19openGallery),
    i19share: () => i18n(i19share),
    i19video: () => i18n(i19video),

    localPictures () {
      return this.pictures && this.pictures.length
        ? this.pictures
        : (this.product.pictures || [])
    },

    videoSrc () {
      const video = this.video || (this.product.videos && this.product.videos[0])
      if (video && video.url) {
        return video.url.replace(/watch\?v=(V7XQvAde51w)/i, 'embed/$1?rel=0')
      }
      return null
    },

    pswpItems () {
      const pswpItems = []
      this.localPictures.forEach(({ zoom }) => {
        if (zoom) {
          let w, h
          if (zoom.size) {
            const sizes = zoom.size.split('x')
            if (sizes.length === 2) {
              w = parseInt(sizes[0], 10)
              h = parseInt(sizes[1], 10)
            }
          }
          if (!w || !h) {
            w = h = 1000
          }
          pswpItems.push({
            src: zoom.url,
            title: getName(this.product) || zoom.alt,
            w,
            h
          })
        }
      })
      return pswpItems
    },

    pswpOptions () {
      return {
        shareButtons: [
          {
            id: 'facebook',
            label: i18n(i19shareOnFacebook),
            url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
          },
          {
            id: 'twitter',
            label: 'Tweet',
            url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'
          },
          {
            id: 'pinterest',
            label: 'Pin it',
            url: 'http://www.pinterest.com/pin/create/button/' +
              '?url={{url}}&media={{image_url}}&description={{text}}'
          }
        ]
      }
    }
  },

  methods: {
    getImg,

    moveSlider (index) {
      this.activeIndex = index
      this.$emit('update:current-slide', index + 1)
      if (this.glide) {
        this.glide.go('=' + index)
      }
      if (!this.isSliderMoved) {
        this.isSliderMoved = true
      }
    },

    openZoom (index) {
      
      this.zoomLinkStyle = 'cursor: wait'
      return import(/* webpackPrefetch: true */ 'photoswipe')
        .then(pack => {
          const PhotoSwipe = pack.default
          return import(/* webpackPrefetch: true */ 'photoswipe/dist/photoswipe-ui-default').then(pack => {
            const psUi = pack.default
            this.pswp = new PhotoSwipe(this.$refs.pswp, psUi, this.pswpItems, {
              ...this.pswpOptions,
              index
            })
            this.pswp.init()
          })
        })
        .catch(console.error)
        .finally(() => {
          this.zoomLinkStyle = null
        })
    },

    buy () {
      const { product } = this
      this.$emit('buy', { product })
      if (product.variations && product.variations.length) {
        if (window.location.pathname !== `/${product.slug}`) {
          window.location = `/${product.slug}`
        } else {
          window.location = '#variations'
        }
      } else {
        ecomCart.addProduct(product)
      }
      if (this.pswp) {
        this.pswp.close()
      }
    },
    photoswipperLightboxInit(){
      console.log('photoswipperLightbox')
      var section_zoom = function () {
          $(".tf-image-zoom").on("mouseover", function () {
              $(this).closest(".section-image-zoom").addClass("zoom-active");
          });
          $(".tf-image-zoom").on("mouseleave", function () {
              $(this).closest(".section-image-zoom").removeClass("zoom-active");
          });
      };

      var cus_zoom = function () {
          var image_zoom = function () {
              var driftAll = document.querySelectorAll(".tf-image-zoom");
              var pane = document.querySelector(".tf-zoom-main");

              if (matchMedia("only screen and (min-width: 1200px)").matches) {
                  $(driftAll).each(function (i, el) {
                      if (!el._drift) {
                          el._drift = new Drift(el, {
                              zoomFactor: 2,
                              paneContainer: pane,
                              inlinePane: false,
                              handleTouch: false,
                              hoverBoundingBox: true,
                              containInline: true,
                          });
                      }
                  });
              } else {
                  $(driftAll).each(function (i, el) {
                      if (el._drift) {
                          el._drift.destroy();
                          el._drift = null;
                      }
                  });
              }

              if (typeof $.fn.magnificPopup !== "undefined") {
                  $(driftAll).magnificPopup({
                      type: "image",
                      gallery: {
                          enabled: true,
                      },
                      zoom: {
                          enabled: true,
                      },
                  });
              }
          };

          window.addEventListener("resize", image_zoom);
          image_zoom();
      };

      var image_zoom_magnifier = function () {
          var driftAll = document.querySelectorAll(".tf-image-zoom-magnifier");
          $(driftAll).each(function (i, el) {
              new Drift(el, {
                  zoomFactor: 2,
                  inlinePane: true,
                  containInline: false,
              });
          });
      };

      var image_zoom_inner = function () {
          var driftAll = document.querySelectorAll(".tf-image-zoom-inner");
          var pane = document.querySelector(".tf-product-zoom-inner");
          $(driftAll).each(function (i, el) {
              new Drift(el, {
                  paneContainer: pane,
                  zoomFactor: 2,
                  inlinePane: false,
                  containInline: false,
              });
          });
      };

      var lightboxswiper = function () {
          const lightbox = new PhotoSwipeLightbox({
              gallery: "#gallery-swiper-started",
              children: "a",
              pswpModule: window.PhotoSwipe,
              bgOpacity: 1,
              secondaryZoomLevel: 2,
              maxZoomLevel: 3,
          });
          lightbox.init();

          lightbox.on("change", () => {
              const { pswp } = lightbox;
              main.slideTo(pswp.currIndex, 0, false);
          });

          lightbox.on("afterInit", () => {
              if (main.params.autoplay.enabled) {
                  main.autoplay.stop();
              }
          });

          lightbox.on("closingAnimationStart", () => {
              const { pswp } = lightbox;
              main.slideTo(pswp.currIndex, 0, false);
              if (main.params.autoplay.enabled) {
                  main.autoplay.start();
              }
          });
      };

      var lightbox = function () {
          const lightbox = new PhotoSwipeLightbox({
              gallery: "#gallery-started",
              children: "a",
              pswpModule: window.PhotoSwipe,
              bgOpacity: 1,
              secondaryZoomLevel: 2,
              maxZoomLevel: 3,
          });
          lightbox.init();
      };

      var model_viewer = function () {
          if ($(".tf-model-viewer").length) {
              $(".tf-model-viewer-ui-button").on("click", function (e) {
                  $(this).closest(".tf-model-viewer").find("model-viewer").removeClass("disabled");
                  $(this).closest(".tf-model-viewer").toggleClass("active");
              });

              $(".tf-model-viewer-ui").on("dblclick", function (e) {
                  const modelViewer = $(this).closest(".tf-model-viewer").find("model-viewer")[0];

                  $(this).closest(".tf-model-viewer").find("model-viewer").addClass("disabled");
                  $(this).closest(".tf-model-viewer").toggleClass("active");

                  if (modelViewer) {
                      modelViewer.cameraOrbit = "0deg 90deg auto";
                      // modelViewer.fieldOfView = "45deg";
                      modelViewer.updateFraming();
                  }
              });
          }
      };
      if(!this.isQuickview){
        section_zoom();
        cus_zoom();
        image_zoom_magnifier();
        image_zoom_inner();
        lightboxswiper();
        lightbox();
        model_viewer();
      }
    },
  },

  watch: {
    currentSlide: {
      handler (currentSlide) {
        // this.activeIndex = currentSlide - 1
      },
      immediate: true
    },

    activeIndex (index) {
      // this.moveSlider(index)
    },
    
  },

  mounted () {
    // Swiper integration for thumbs and main gallery (adapted for ProductGallery.html structure)
   
    
    // const glide = new Glide(this.$refs.glide, this.glideOptions)
    // glide.on('run', () => {
    //   this.moveSlider(glide.index)
    // })
    // glide.mount()
    // this.glide = glide
    // Importa o zoom.js apenas no client-side, após montagem, sem quebrar o build
    if (typeof window !== 'undefined') {
      // Swiper thumbs/main
      if (document.querySelector('.thumbs-slider')) {
        var tfThumbs = document.querySelector('.tf-product-media-thumbs');
        var direction = (tfThumbs && tfThumbs.dataset ? tfThumbs.dataset.direction : null) || 'vertical';
        var thumbs = new window.Swiper('.tf-product-media-thumbs', {
          spaceBetween: 10,
          slidesPerView: 'auto',
          freeMode: true,
          watchSlidesProgress: true,
          observer: true,
          observeParents: true,
          direction: 'horizontal',
          navigation: {
            nextEl: '.thumbs-next',
            prevEl: '.thumbs-prev',
          },
          breakpoints: {
            0: { direction: 'horizontal' },
            1200: { direction: direction },
          },
        });
        var main = new window.Swiper('.tf-product-media-main', {
          spaceBetween: 0,
          observer: true,
          observeParents: true,
          speed: 800,
          thumbs: { swiper: thumbs },
        });

        const modelViewer = document.querySelector('.slide-3d');
        if (modelViewer) {
          modelViewer.addEventListener('mouseenter', () => { main.allowTouchMove = false; });
          modelViewer.addEventListener('mouseleave', () => { main.allowTouchMove = true; });
        }

        function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
        function updateActiveButton(type, activeIndex) {
          var btnClass = `.${type}-btn`;
          var dataAttr = `data-${type}`;
          var currentClass = `.value-current${capitalizeFirstLetter(type)}`;
          var selectClass = `.select-current${capitalizeFirstLetter(type)}`;
          document.querySelectorAll(btnClass).forEach(btn => btn.classList.remove('active'));
          var slides = document.querySelectorAll('.tf-product-media-main .swiper-slide');
          var currentSlide = slides[activeIndex];
          var currentValue = currentSlide ? currentSlide.getAttribute(dataAttr) : null;
          if (currentValue) {
            document.querySelectorAll(`${btnClass}[${dataAttr}='${currentValue}']`).forEach(btn => btn.classList.add('active'));
            document.querySelectorAll(currentClass).forEach(el => el.textContent = currentValue);
            document.querySelectorAll(selectClass).forEach(el => el.textContent = currentValue);
          }
        }
        function scrollTo(type, value, color) {
          if (!value || !color) return;
          var slides = Array.from(document.querySelectorAll('.tf-product-media-main .swiper-slide'));
          var firstIndex = slides.findIndex(slide => slide.getAttribute(`data-${type}`) === value && slide.getAttribute('data-color') === color);
          if (firstIndex === -1) {
            firstIndex = slides.findIndex(slide => slide.getAttribute(`data-${type}`) === value);
          }
          if (firstIndex > -1) {
            main.slideTo(firstIndex, 1000, false);
            thumbs.slideTo(firstIndex, 1000, false);
          }
        }
        function setupVariantButtons(type) {
          document.querySelectorAll(`.${type}-btn`).forEach(btn => {
            btn.addEventListener('click', function () {
              var value = btn.dataset[type];
              var color = (document.querySelector('.value-currentColor') || {}).textContent;
              document.querySelectorAll(`.${type}-btn`).forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              scrollTo(type, value, color);
            });
          });
        }
        ['color', 'size'].forEach(type => {
          main.on('slideChange', function () {
            updateActiveButton(type, this.activeIndex);
          });
          setupVariantButtons(type);
          updateActiveButton(type, main.activeIndex);
        });
      }

      // Section zoom
      document.querySelectorAll('.tf-image-zoom').forEach(img => {
        img.addEventListener('mouseover', function () {
          const section = img.closest('.section-image-zoom');
          if (section) section.classList.add('zoom-active');
        });
        img.addEventListener('mouseleave', function () {
          const section = img.closest('.section-image-zoom');
          if (section) section.classList.remove('zoom-active');
        });
      });

      // Drift zoom (cus_zoom)
      function driftZoom() {
        const driftAll = document.querySelectorAll('.tf-image-zoom');
        const pane = document.querySelector('.tf-zoom-main');
        if (window.matchMedia('only screen and (min-width: 1200px)').matches) {
          driftAll.forEach(el => {
            if (!el._drift && window.Drift) {
              el._drift = new window.Drift(el, {
                zoomFactor: 4,
                paneContainer: pane,
                inlinePane: false,
                handleTouch: false,
                hoverBoundingBox: true,
                containInline: true,
                sourceAttribute: 'data-zoom',
                inlinePane: 50,
              });
            }
          });
        } else {
          driftAll.forEach(el => {
            if (el._drift) {
              el._drift.destroy();
              el._drift = null;
            }
          });
        }
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.magnificPopup) {
          window.jQuery(driftAll).magnificPopup({
            type: 'image',
            gallery: { enabled: true },
            zoom: { enabled: true },
          });
        }
      }
      console.log(this.isQuickview,'quick')
      if(!this.isQuickview){
        window.addEventListener('resize', driftZoom);
        driftZoom();
      }

      // Drift magnifier
      document.querySelectorAll('.tf-image-zoom-magnifier').forEach(el => {
        if (window.Drift) {
          new window.Drift(el, {
            zoomFactor: 2,
            inlinePane: true,
            containInline: false,
          });
        }
      });

      // Drift inner zoom
      const paneInner = document.querySelector('.tf-product-zoom-inner');
      document.querySelectorAll('.tf-image-zoom-inner').forEach(el => {
        if (window.Drift) {
          new window.Drift(el, {
            paneContainer: paneInner,
            zoomFactor: 2,
            inlinePane: false,
            containInline: false,
          });
        }
      });

      // Lightbox Swiper
      if (window.PhotoSwipeLightbox && window.PhotoSwipe) {
        const lightbox = new window.PhotoSwipeLightbox({
          gallery: '#gallery-swiper-started',
          children: 'a',
          pswpModule: window.PhotoSwipe,
          bgOpacity: 1,
          secondaryZoomLevel: 2,
          maxZoomLevel: 3,
        });
        lightbox.init();
        lightbox.on('change', () => {
          const { pswp } = lightbox;
          if (window.main) window.main.slideTo(pswp.currIndex, 0, false);
        });
        lightbox.on('afterInit', () => {
          if (window.main && window.main.params.autoplay && window.main.params.autoplay.enabled) {
            window.main.autoplay.stop();
          }
        });
        lightbox.on('closingAnimationStart', () => {
          const { pswp } = lightbox;
          if (window.main) window.main.slideTo(pswp.currIndex, 0, false);
          if (window.main && window.main.params.autoplay && window.main.params.autoplay.enabled) {
            window.main.autoplay.start();
          }
        });
      }

      // Lightbox simples
      if (window.PhotoSwipeLightbox && window.PhotoSwipe) {
        const lightbox = new window.PhotoSwipeLightbox({
          gallery: '#gallery-started',
          children: 'a',
          pswpModule: window.PhotoSwipe,
          bgOpacity: 1,
          secondaryZoomLevel: 2,
          maxZoomLevel: 3,
        });
        lightbox.init();
      }

      // Model viewer
      document.querySelectorAll('.tf-model-viewer').forEach(viewer => {
        viewer.querySelectorAll('.tf-model-viewer-ui-button').forEach(btn => {
          btn.addEventListener('click', function () {
            viewer.querySelector('model-viewer').classList.remove('disabled');
            viewer.classList.toggle('active');
          });
        });
        viewer.querySelectorAll('.tf-model-viewer-ui').forEach(ui => {
          ui.addEventListener('dblclick', function () {
            const modelViewer = viewer.querySelector('model-viewer');
            modelViewer.classList.add('disabled');
            viewer.classList.toggle('active');
            if (modelViewer) {
              modelViewer.cameraOrbit = '0deg 90deg auto';
              if (modelViewer.updateFraming) modelViewer.updateFraming();
            }
          });
        });
      });
    }

    setTimeout(() => {
      if ($(".stagger-wrap").length) {
            var count = $(".stagger-item").length;
            for (var i = 1, time = 0.2; i <= count; i++) {
                $(".stagger-item:nth-child(" + i + ")")
                    .css("transition-delay", time * i + "s")
                    .addClass("stagger-finished");
            }
        }
      }, 1000)
    this.photoswipperLightboxInit();

  },

  beforeDestroy () {
    // if (this.glide) {
    //   this.glide.destroy()
    // }
    // if (this.pswp) {
    //   this.pswp.destroy()
    // }
  }
}