import appState from '@builder.io/app-context';
import { getSFCCWebhookIndex } from './utils';

interface ContentEditorActions {
  updatePreviewUrl: (url: string) => void;
  safeReaction<T>(
    watchFunction: () => T,
    reactionFunction: (arg: T) => void,
    options?: {
      fireImmediately: true;
    }
  ): void;
}

export const onContentEditorLoad = ({ safeReaction, updatePreviewUrl }: ContentEditorActions) => {
  safeReaction(
    () =>
      appState.designerState.editingContentModel?.meta.get('sfccPreviewOptions') ||
      appState.designerState.draftContentModel?.meta.get('sfccPreviewOptions'),
    (obj: any) => {
      if (getSFCCWebhookIndex(appState.designerState.editingModel) === -1) {
        // running on a non sfcc model
        return;
      }
      if (obj) {
        const options = JSON.parse(JSON.stringify(obj));
        const previewUrl = getPath(options);
        setTimeout(() => updatePreviewUrl(previewUrl), 500);
        appState.snackBar.show(`Previewing ${previewUrl}`);
      } else {
        const previewUrl = appState.editingModel?.examplePageUrl;
        if (previewUrl) {
          setTimeout(() => updatePreviewUrl(previewUrl), 500);
          appState.snackBar.show(`Previewing ${previewUrl}`);
        }
      }
    }
  );
};

export const getPath = (options: {
  apiPath: string;
  libraryName: string;
  assetId: string;
  pathPrefix?: string;
}) => {
  const { apiPath, libraryName, assetId, pathPrefix = '' } = options;
  const parts = pathPrefix.split('/');
  return `${apiPath}/s/${libraryName}/${
    pathPrefix ? `${parts.filter(p => p).join('/')}/` : ''
  }${assetId}.html`.trim();
};
