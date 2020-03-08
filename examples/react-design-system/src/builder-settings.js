import { Builder, builder } from '@builder.io/react';
import { menus } from './builder-menus';
// Be sure to import all of your components where you use <BuilderComponent /> so they are
// bundled and accessible
import './components/ProductsList/ProductsList.builder';
import './components/Hero/Hero.builder';
import './components/TripleColumns/TripleColumns.builder';
import './components/DoubleColumns/DoubleColumns.builder';
import './components/Review/Review.builder';
import './components/ReviewsSlider/ReviewsSlider.builder';
import './components/Button/Button.builder';
import './components/Heading/Heading.builder';
import './components/HeroWithChildren/HeroWithChildren.builder';
import './components/DynamicColumns/DynamicColumns.builder';
import './components/ProductsListWithServerSideData/ProductsListWithServerSideData.builder';

// Add your public apiKey here
const YOUR_KEY = 'YJIGb4i01jvw0SRdL5Bt';
builder.init(YOUR_KEY);

// Remove this to allow all built-in components to be used too
const OVERRIDE_INSERT_MENU = false;

if (OVERRIDE_INSERT_MENU) {
  // (optionally) use this to hide all default built-in components and fully manage
  // the insert menu components and sections yourself
  Builder.set({ customInsertMenu: true });
}

// (optionally) set these to add your own sections of components arranged as you choose.
// this can be used with or without `customInsertMenu` above
menus.forEach(menu => Builder.register('insertMenu', menu));
