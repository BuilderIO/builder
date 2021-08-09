import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { Builder } from '@builder.io/react';
import { useState, PropsWithChildren } from 'react';

const EmojiButton = (
  props: PropsWithChildren<{
    type: string;
    onClick?: () => void;
    selected?: boolean;
  }>,
) => {
  // Eager fetch on render, but keep async (in particular bc track.ts
  // uses browser only libraries so must not be imported on server)
  const importTrackPromise = Builder.isBrowser
    ? import('../functions/track')
    : null;

  return (
    <IconButton
      className="emoji-button"
      css={{
        // Makes our emotion custom CSS stronger, or else it gets overridden by
        // Material UI styles
        '&.emoji-button': {
          color: 'black',
          fontSize: 45,
          transform: 'scale(0.8)',
          transition: 'transform 0.2s ease-in-out, grayscale 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1)',
          },
          ...(props.selected === false && {
            filter: 'grayscale(100%)',
          }),
          ...(props.selected === true && {
            transform: 'scale(1)',
          }),
        },
      }}
      onClick={async () => {
        props.onClick?.();
        const { track } = await importTrackPromise!;
        track('docsCsatResponse', {
          answer: props.type,
        });
      }}
    >
      {props.children}
    </IconButton>
  );
};

export function CsatWidget(props: { className?: string }) {
  const [selection, setSelection] = useState<null | string>(null);

  return (
    <div
      css={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={props.className}
    >
      <div css={{ textAlign: 'center', fontSize: 18, opacity: 0.8 }}>
        Was this article helpful?
      </div>
      <div css={{ display: 'flex' }}>
        <Tooltip title="Not helpful">
          <div>
            <EmojiButton
              selected={selection ? selection === 'negative' : undefined}
              onClick={() => setSelection('negative')}
              type="negative"
            >
              😞
            </EmojiButton>
          </div>
        </Tooltip>
        <Tooltip title="Neutral">
          <div>
            <EmojiButton
              selected={selection ? selection === 'neutral' : undefined}
              onClick={() => setSelection('neutral')}
              type="neutral"
            >
              😐
            </EmojiButton>
          </div>
        </Tooltip>
        <Tooltip title="Helpful">
          <div>
            <EmojiButton
              selected={selection ? selection === 'positive' : undefined}
              onClick={() => setSelection('positive')}
              type="positive"
            >
              😃
            </EmojiButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
