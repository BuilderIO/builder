console.debug('Background script loaded...');

const INITIATORS = [
  'https://builder.io',
  'https://qa.builder.io',
  'https://beta.builder.io',
  'https://local.builder.io',
  'http://local.builder.io:1234',
  'http://localhost:1234',

  // TODO: Add your own domain here
  'https://www.mydomain.com',
];

const REMOVE_HEADERS = ['x-frame-options', 'content-security-policy'];

let bound = false;

function addListeners() {
  // FIXME: add raven to see what errors are occuring on first install

  // TODO: move this to typescript to catch possible type issues like some of this data
  // being optional and not existing
  addEventListener('error', function (event) {
    console.error('error', event.error, event.message, event.filename, event.lineno);
  });

  // TODO: limit requests this happens on to *.builder.io pages
  // TODO: maybe chrome.webRequest isn't available until onInstall?
  chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
      if (
        (details.type !== 'sub_frame' && details.frameType !== 'sub_frame') ||
        !(
          INITIATORS.includes(details.initiator) ||
          details.url.includes('builder.editing=') ||
          details.url.includes('csrf')
        )
      ) {
        return;
      }

      let modified = false;
      const newResponseHeaders = details && details.responseHeaders || [];
      newResponseHeaders?.forEach(header => {
        if (header.name.toLowerCase() === 'set-cookie') {
          if (header.value) {
            // Cookies with SameSite=None must also specify Secure, meaning they require a secure context.
            const sameSiteValue = ' SameSite=None';
            // Cookies without a SameSite attribute will be treated as SameSite=Lax
            const isLax =
              header.value.toLowerCase().includes('samesite=lax') ||
              !header.value.toLowerCase().includes('samesite');
            if (isLax) {
              let hasSamesite = false;
              let hasSecure = false;
              const parts = header.value.split(';').map(pair => {
                if (pair.toLowerCase().includes('samesite')) {
                  hasSamesite = true;
                  return sameSiteValue;
                }
                if (pair.toLowerCase().includes('secure')) {
                  // we should add secure if not already there
                  hasSecure = true;
                }
                return pair;
              });

              if (!hasSamesite) {
                parts.push(sameSiteValue);
              }
              if (!hasSecure) {
                parts.push(' Secure');
              }
              header.value = parts.join(';');
              modified = true;
            }
          }
        }
      });

      if (modified) {
        return {
          responseHeaders: newResponseHeaders,
        };
      }
    },
    // Change this to your own domain
    // { urls: ['<all_urls>'] },
    { urls: ['https://www.mydomain.com/*'] },
    [
      'blocking',
      'responseHeaders',

      // We need `extraHeaders` to be able to modify `x-frame-options` and
      // `content-security-policy` headers.
      // https://developer.chrome.com/docs/extensions/reference/webRequest/
      'extraHeaders',
    ]
  );

  bound = true;
}

chrome.runtime.onInstalled.addListener(function () {
  if (!bound) {
    addListeners();
  }
});

try {
  if (!bound) {
    addListeners();
  }
} catch (error) {
  console.error("Couldn't add listeners", error);
}

