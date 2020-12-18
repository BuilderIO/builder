export const updatePreviewUrl = (previewUrl: string) => {
  window.postMessage(
    {
      type: 'builder.updateEditorOptions',
      data: {
        data: { previewUrl },
      },
    },
    '*'
  );
};
