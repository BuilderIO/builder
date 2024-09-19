/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import appState from '@builder.io/app-context';
import {
  AdditionalInfo,
  CompactView,
  CompactViewProps,
  Login,
  Modal,
  type selectionMode,
} from '@bynder/compact-view';
import { Button, IconButton, Paper, Tooltip, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { IconCloudUpload } from '@tabler/icons-react';
import { partial } from 'filesize';

import type {
  BuilderPluginProps,
  BynderAsset,
  BynderAssetFile,
  BynderCompactViewProps,
  RenderSinglePreviewProps,
} from './types';
import {
  ASSET_FIELD_SELECTION,
  AssetTypes,
  BYNDER_LANGUAGE,
  BYNDER_URL,
  SHOW_ASSET_FIELD_SELECTION,
  SupportedLanguage,
  SupportedLanguages,
  fastClone,
  pluginId,
} from './utils';

const filesize = partial({ standard: 'jedec' });

// This component is what handles rendering when the user selects the Bynder plugin
// It is recommended for additional versions of this Selector to keep the input type (BynderAssetFile),
// even if SingleSelect and MultiSelect modes do not return the additionalInfo object
export const AssetSelector: React.FC<BuilderPluginProps<BynderAssetFile>> = props => {
  const addProps = {
    ...props,
    // The Bynder CompactView mode to use. SingleSelectFile provides DAT and other asset transforms.
    mode: 'SingleSelectFile' as selectionMode,
    // Hopefully Builder will provide a way to select these via the plugin interface,
    // such they are set per input instance. Hardcoded for now.
    assetTypes: AssetTypes,
  };
  return <BynderCompactViewWrapper {...addProps} />;
};

// A generic component that could be expanded to handle both single and multi-select modes
export const BynderCompactViewWrapper = (props: BynderCompactViewProps) => {
  const { value, onChange, context, mode, assetTypes } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  // `value` is a MobX proxy object. Convert back to a plain object with fastClone for easier use.
  // Keep a local state value because onChange does not trigger a re-render with a new value object.
  const [internalValue, setInternalValue] = React.useState(fastClone(value));

  const onChangeWrapper = (asset: BynderAssetFile) => {
    onChange(asset);
    setInternalValue(asset);
  };

  // additionalInfo is only returned by Bynder when mode === "SingleSelectFile"
  const onSuccess = (assets: unknown[], additionalInfo: AdditionalInfo) => {
    onChangeWrapper({ assets: assets as BynderAsset[], additionalInfo });
    // Manually close the modal. The onClose prop only fires when the user clicks the close button.
    setIsOpen(false);
  };

  const selectedAssets = React.useMemo(() => {
    return (internalValue?.assets ?? []).map(asset => asset.id);
  }, [internalValue]);

  // Get the saved Bynder URL from the plugin settings
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const url = pluginSettings?.get(BYNDER_URL);
  const language = pluginSettings?.get(BYNDER_LANGUAGE) as SupportedLanguage;

  const bynderProps: CompactViewProps = {
    onSuccess,
    language: language ?? SupportedLanguages[0],
    mode,
    assetTypes,
    // selectedAssets, // There is a bug with selectedAssets on the React package that selects the first asset instead of the previously selected one.
  };

  // Add the assetFieldSelection prop only if the user has enabled it in advanced settings
  if (pluginSettings?.get(SHOW_ASSET_FIELD_SELECTION)) {
    bynderProps.assetFieldSelection = pluginSettings?.get(ASSET_FIELD_SELECTION);
  }

  return (
    <div>
      {/* Opportunity: show the # of selected items if multi-select? Previews as Chips/list? */}
      {/* {mode === "MultiSelect" && ()} */}
      {/* If you don't need the DAT or Asset Derivatives, just use SingleSelect */}
      {/* {mode === "SingleSelect" && ()} */}

      {mode === 'SingleSelectFile' && (
        <RenderSinglePreview
          value={internalValue}
          onClick={() => setIsOpen(true)}
          onClear={() => {
            onChangeWrapper({ assets: [] });
          }}
          context={context}
        />
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Login portal={{ url, editable: false }} language={bynderProps.language}>
          <CompactView {...bynderProps} />
        </Login>
      </Modal>
    </div>
  );
};

const RenderSinglePreview: React.FC<RenderSinglePreviewProps> = ({
  value,
  onClick,
  onClear,
  context,
}) => {
  // Builder provided context for matching the editor theme
  const theme = context.theme;

  const asset = value?.assets?.[0];
  // Account for translated assets / DAT, when using the "SingleSelectFile" mode.
  // Fallback to the selected asset if additionalInfo isn't provided.
  const displayAsset = value?.additionalInfo?.selectedFile ?? asset?.files?.webImage;
  const thumbnailAsset = value?.additionalInfo?.selectedFile ?? asset?.files?.thumbnail;

  const fileName = asset && `${asset?.name}.${asset.extensions[0]}`;
  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        '&:hover .close-button': { display: 'flex' },
        position: 'relative',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 4,
        padding: 8,
      }}
    >
      {asset ? (
        <div
          css={{
            position: 'relative',
            '&:hover .close-button': { opacity: 1 },
          }}
        >
          <div
            css={{
              height: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => window.open(displayAsset?.url, '_blank')}
          >
            <Paper
              css={{
                display: 'inline-block',
                fontSize: 0,
                marginTop: 3,
                overflow: 'hidden',
                '&:hover': {
                  border: `1px solid ${theme.colors.primary}`,
                },
              }}
            >
              <img
                key={asset.id}
                onContextMenu={e => {
                  // Allow normal context menu on right click so people can "copy image url",
                  // don't propagate to the blocking custom context menu
                  e.stopPropagation();
                }}
                css={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src={thumbnailAsset?.url}
                // TODO: Error handling when the image fails to load?
                onError={error => { }}
              />
            </Paper>
          </div>
        </div>
      ) : (
        <div
          css={{
            padding: 20,
            borderRadius: 4,
            backgroundColor: theme.colors.bgSecondary,
          }}
        >
          <IconCloudUpload
            css={{
              color: theme.colors.border,
            }}
          />
        </div>
      )}

      {asset && (
        <Tooltip title={`Remove asset`}>
          <IconButton
            className="close-button"
            component="label"
            css={{
              position: 'absolute',
              top: 4,
              right: 4,
              display: 'none',
              padding: 4,
            }}
            onClick={onClear}
          >
            <Close css={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {fileName && (
          <React.Fragment>
            <div>
              <Typography
                title={asset.name}
                css={{
                  fontSize: 12,
                  color: theme.colors.text.regular,
                  marginLeft: 8,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: 'inline-block',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  },
                }}
              >
                <a href={displayAsset?.url} target="_blank"></a>
                {fileName}
              </Typography>
            </div>
            {displayAsset?.fileSize && (
              <div>
                <Typography
                  css={{
                    fontSize: 12,
                    color: 'var(--text-caption)',
                    marginLeft: 8,
                  }}
                >
                  {filesize(displayAsset.fileSize)}
                </Typography>
              </div>
            )}
          </React.Fragment>
        )}
        <div css={{ width: '100%' }}>
          <Button
            color="primary"
            onClick={onClick}
            css={{
              marginLeft: 8,
              ...(fileName && {
                padding: '0 5px',
                fontSize: 12,
              }),
            }}
          >
            {`${asset ? 'Change' : 'Choose'} Bynder Asset`}
          </Button>
        </div>
      </div>
    </div>
  );
};
