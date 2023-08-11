function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const getEventHandlerName = (key) => `on${capitalizeFirstLetter(key)}`;
export {
  getEventHandlerName
};
