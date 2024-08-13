/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import appState from '@builder.io/app-context';
import { AdditionalInfo, CompactView, CompactViewProps, Login, Modal } from '@bynder/compact-view';
import { Button, IconButton, Paper, Tooltip, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { IconCloudUpload } from '@tabler/icons-react';
import { partial } from 'filesize';

import type {
  BynderAsset,
  BynderCompactViewProps,
  RenderSinglePreviewProps,
  SharedProps,
  SingleSelectProps,
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
export const SingleSelect: React.FC<SingleSelectProps & SharedProps> = props => {
  return <BynderCompactView {...props} mode="SingleSelect" assetTypes={AssetTypes} />;
};

// A generic component that could be expanded to handle both single and multi-select modes
export const BynderCompactView: React.FC<BynderCompactViewProps> = props => {
  const { value, onChange, context, mode, assetTypes } = props;
  const [isOpen, setIsOpen] = React.useState(false);

  // `value` is a MobX proxy object. Convert back to a usable object with fastClone.
  // Keep a local state value because onChange does not trigger a re-render with a new value object.
  const [internalValue, setInternalValue] = React.useState(fastClone(value));

  const onChangeWrapper = (asset: typeof value) => {
    // onChange has odd TS typing here
    onChange(asset as any);
    setInternalValue(asset);
  };

  // additionalInfo is only returned by Bynder when mode === "SingleSelectFile"
  const onSuccess = (assets: unknown[], additionalInfo: AdditionalInfo) => {
    if (mode === 'MultiSelect') {
      onChangeWrapper(assets as BynderAsset[]);
    } else {
      onChangeWrapper(assets[0] as BynderAsset);
    }
    // Manually close the modal. The onClose prop does not appear to fire.
    setIsOpen(false);
  };

  const selectedAssets = React.useMemo(() => {
    if (mode === 'SingleSelect') {
      const id = (internalValue as BynderAsset)?.id;
      return id ? [id] : [];
    } else
      return internalValue?.length ? (internalValue as BynderAsset[]).map(asset => asset.id) : [];
  }, [internalValue, mode]);

  // Get the saved Bynder URL from the plugin settings
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const url = pluginSettings?.get(BYNDER_URL);
  const language = pluginSettings?.get(BYNDER_LANGUAGE) as SupportedLanguage;

  const bynderProps: CompactViewProps = {
    onSuccess,
    language: language ?? SupportedLanguages[0],
    mode,
    assetTypes, // this was breaking for some reason
    selectedAssets,
  };
  // Add the assetFieldSelection prop only if the user has enabled it in advanced settings
  if (pluginSettings?.get(SHOW_ASSET_FIELD_SELECTION)) {
    bynderProps.assetFieldSelection = pluginSettings?.get(ASSET_FIELD_SELECTION);
  }

  return (
    <div>
      {/* Opportunity: show the # of selected items if multi-select? Previews as Chips/list? */}
      {/* {mode === "MultiSelect" && ()} */}

      {mode === 'SingleSelect' && (
        <RenderSinglePreview
          asset={internalValue as BynderAsset}
          onClick={() => setIsOpen(true)}
          onClear={() => {
            // Cannot set undefined to the MobX proxy object, so set to null
            onChangeWrapper(null);
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
  asset,
  additionalInfo, // TODO: Find a way to incorporate this for "SingleSelectFile" inputs?
  onClick,
  onClear,
  context,
}) => {
  const theme = context.theme;

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
            onClick={() => window.open(asset.files.webImage.url, '_blank')}
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
                src={asset.files.thumbnail.url}
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
                <a href={asset.files.webImage.url} target="_blank"></a>
                {fileName}
              </Typography>
            </div>
            {asset.files.webImage.fileSize && (
              <div>
                <Typography
                  css={{
                    fontSize: 12,
                    color: 'var(--text-caption)',
                    marginLeft: 8,
                  }}
                >
                  {filesize(asset.files.webImage.fileSize)}
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
