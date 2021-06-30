if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.sdkInfo',
      data: {
        // TODO: compile these in
        type: process.env.SDK_TYPE,
        version: process.env.SDK_VERSION
      },
    },
    '*'
  );
}
