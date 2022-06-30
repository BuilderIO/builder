<template>
  <div id="home">
    <LazyHydrate when-idle>
      <SfHero class="hero">
        <SfHeroItem
          v-for="(hero, i) in heroes"
          :key="i"
          :title="hero.title"
          :subtitle="hero.subtitle"
          :background="hero.background"
          :image="hero.image"
          :class="hero.className"
        />
      </SfHero>
    </LazyHydrate>
    <DynamicallyRenderBuilderPage />
  </div>
</template>
<script>
import Vue from 'vue';
import {
  SfHero,
  SfBanner,
  SfCallToAction,
  SfSection,
  SfCarousel,
  SfProductCard,
  SfImage,
  SfBannerGrid,
  SfHeading,
  SfArrow,
  SfButton,
} from '@storefront-ui/vue';
import { ref, useContext } from '@nuxtjs/composition-api';
import InstagramFeed from '~/components/InstagramFeed.vue';
import NewsletterModal from '~/components/NewsletterModal.vue';
import LazyHydrate from 'vue-lazy-hydration';
import { useUiState } from '../composables';
import cacheControl from './../helpers/cacheControl';
import DynamicallyRenderBuilderPage from '~/components/Builder/DynamicallyRenderBuilderPage.vue';
export default Vue.extend({
  name: 'Home',
  middleware: cacheControl({
    'max-age': 60,
    'stale-when-revalidate': 5,
  }),
  components: {
    DynamicallyRenderBuilderPage,
    InstagramFeed,
    SfHero,
    SfBanner,
    SfCallToAction,
    SfSection,
    SfCarousel,
    SfProductCard,
    SfImage,
    SfBannerGrid,
    SfHeading,
    SfArrow,
    SfButton,
    NewsletterModal,
    LazyHydrate,
  },

  setup() {
    const { $config } = useContext();
    const { toggleNewsletterModal } = useUiState();
    const products = ref([
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productA.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: true,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productB.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productC.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productA.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productB.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productC.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productA.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
      {
        title: 'Cream Beach Bag',
        image: '/homepage/productB.webp',
        price: { regular: '50.00 $' },
        rating: { max: 5, score: 4 },
        isInWishlist: false,
      },
    ]);
    const heroes = [
      {
        title: 'Colorful summer dresses are already in store',
        subtitle: 'SUMMER COLLECTION 2019',
        background: '#eceff1',
        image: '/homepage/bannerH.webp',
      },
      {
        title: 'Colorful summer dresses are already in store',
        subtitle: 'SUMMER COLLECTION 2019',
        background: '#efebe9',
        image: '/homepage/bannerA.webp',
        className: 'sf-hero-item--position-bg-top-left sf-hero-item--align-right',
      },
      {
        title: 'Colorful summer dresses are already in store',
        subtitle: 'SUMMER COLLECTION 2019',
        background: '#fce4ec',
        image: '/homepage/bannerB.webp',
      },
    ];
    const banners = [
      {
        slot: 'banner-A',
        subtitle: 'Dresses',
        title: 'Cocktail & Party',
        description:
          "Find stunning women's cocktail dresses and party dresses. Stand out in lace and metallic cocktail dresses from all your favorite brands.",
        buttonText: 'Shop now',
        image: {
          mobile: $config.theme.home.bannerA.image.mobile,
          desktop: $config.theme.home.bannerA.image.desktop,
        },
        class: 'sf-banner--slim desktop-only',
        link: $config.theme.home.bannerA.link,
      },
      {
        slot: 'banner-B',
        subtitle: 'Dresses',
        title: 'Linen Dresses',
        description:
          "Find stunning women's cocktail dresses and party dresses. Stand out in lace and metallic cocktail dresses from all your favorite brands.",
        buttonText: 'Shop now',
        image: $config.theme.home.bannerB.image,
        class: 'sf-banner--slim banner-central desktop-only',
        link: $config.theme.home.bannerB.link,
      },
      {
        slot: 'banner-C',
        subtitle: 'T-Shirts',
        title: 'The Office Life',
        image: $config.theme.home.bannerC.image,
        class: 'sf-banner--slim banner__tshirt',
        link: $config.theme.home.bannerC.link,
      },
      {
        slot: 'banner-D',
        subtitle: 'Summer Sandals',
        title: 'Eco Sandals',
        image: $config.theme.home.bannerD.image,
        class: 'sf-banner--slim',
        link: $config.theme.home.bannerD.link,
      },
    ];

    const onSubscribe = emailAddress => {
      console.log(`Email ${emailAddress} was added to newsletter.`);
      toggleNewsletterModal();
    };

    const toggleWishlist = index => {
      products.value[index].isInWishlist = !products.value[index].isInWishlist;
    };

    return {
      toggleWishlist,
      toggleNewsletterModal,
      onSubscribe,
      banners,
      heroes,
      products,
    };
  },
});
</script>

<style lang="scss" scoped>
#home {
  box-sizing: border-box;
  padding: 0 var(--spacer-sm);
  @include for-desktop {
    max-width: 1240px;
    padding: 0;
    margin: 0 auto;
  }
}

.hero {
  margin: var(--spacer-xl) auto var(--spacer-lg);
  --hero-item-background-position: center;
  @include for-desktop {
    margin: var(--spacer-xl) auto var(--spacer-2xl);
  }
  .sf-hero-item {
    &:nth-child(even) {
      --hero-item-background-position: left;
      @include for-mobile {
        --hero-item-background-position: 30%;
        ::v-deep .sf-hero-item__subtitle,
        ::v-deep .sf-hero-item__title {
          text-align: right;
          width: 100%;
          padding-left: var(--spacer-sm);
        }
      }
    }
  }
  ::v-deep .sf-hero__control {
    &--right,
    &--left {
      display: none;
    }
  }
}

.banner-grid {
  --banner-container-width: 50%;
  margin: var(--spacer-xl) 0;
  ::v-deep .sf-link:hover {
    color: var(--c-white);
  }
  @include for-desktop {
    margin: var(--spacer-2xl) 0;
    ::v-deep .sf-link {
      --button-width: auto;
      text-decoration: none;
    }
  }
}

.banner {
  &__tshirt {
    background-position: left;
  }
  &-central {
    @include for-desktop {
      --banner-container-flex: 0 0 70%;
    }
  }
}

.similar-products {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacer-2xs);
  --heading-padding: 0;
  border-bottom: 1px var(--c-light) solid;
  @include for-desktop {
    border-bottom: 0;
    justify-content: center;
    padding-bottom: 0;
  }
}

.call-to-action {
  background-position: right;
  margin: var(--spacer-xs) 0;
  @include for-desktop {
    margin: var(--spacer-xl) 0 var(--spacer-2xl) 0;
  }
}

.carousel {
  margin: 0 calc(0 - var(--spacer-sm)) 0 0;
  @include for-desktop {
    margin: 0;
  }
  &__item {
    margin: 1.375rem 0 2.5rem 0;
    @include for-desktop {
      margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
    }
    &__product {
      --product-card-add-button-transform: translate3d(0, 30%, 0);
    }
  }
  ::v-deep .sf-arrow--long .sf-arrow--right {
    --arrow-icon-transform: rotate(180deg);
    -webkit-transform-origin: center;
    transform-origin: center;
  }
}
</style>
