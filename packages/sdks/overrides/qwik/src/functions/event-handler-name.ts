function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getEventHandlerName = (key: string) =>
  `on${capitalizeFirstLetter(key)}$`;
