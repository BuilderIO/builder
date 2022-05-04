// This is needed because we use the `CustomEvent` API to communicate with our Builder Visual Editor in the iframe.
import 'custom-event-polyfill';
// this is needed because react-native's URL polyfill is lacking all features we use, such as `URLSearchParams.set()`.
import 'react-native-url-polyfill/auto';
