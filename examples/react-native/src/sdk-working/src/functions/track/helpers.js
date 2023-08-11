import { TARGET } from "../../constants/target";
import { isBrowser } from "../is-browser";
const getLocation = () => {
  if (TARGET === "reactNative") {
    return null;
  } else if (isBrowser()) {
    const parsedLocation = new URL(location.href);
    if (parsedLocation.pathname === "") {
      parsedLocation.pathname = "/";
    }
    return parsedLocation;
  } else {
    console.warn("Cannot get location for tracking in non-browser environment");
    return null;
  }
};
const getUserAgent = () => typeof navigator === "object" && navigator.userAgent || "";
const getUserAttributes = () => {
  const userAgent = getUserAgent();
  const isMobile = {
    Android() {
      return userAgent.match(/Android/i);
    },
    BlackBerry() {
      return userAgent.match(/BlackBerry/i);
    },
    iOS() {
      return userAgent.match(/iPhone|iPod/i);
    },
    Opera() {
      return userAgent.match(/Opera Mini/i);
    },
    Windows() {
      return userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i);
    },
    any() {
      return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || TARGET === "reactNative";
    }
  };
  const isTablet = userAgent.match(/Tablet|iPad/i);
  const url = getLocation();
  return {
    urlPath: url == null ? void 0 : url.pathname,
    host: (url == null ? void 0 : url.host) || (url == null ? void 0 : url.hostname),
    device: isTablet ? "tablet" : isMobile.any() ? "mobile" : "desktop"
  };
};
export {
  getUserAttributes
};
