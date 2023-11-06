const getFunctionArguments = ({
  builder,
  context,
  event,
  state
}) => {
  return Object.entries({
    state,
    Builder: builder,
    builder,
    context,
    event
  });
};

export { getFunctionArguments }