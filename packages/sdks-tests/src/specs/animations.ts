export const ANIMATIONS = {
  data: {
    title: 'animations',
    themeId: false,
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-6ccfdba788cf4a70bfddd9a91248f456',
        animations: [
          {
            trigger: 'scrollInView',
            animation: 'fadeInRight',
            steps: [
              {
                id: 'e55a3136bbd24aa68ca850defa3841be',
                isStartState: false,
                styles: { opacity: '0', transform: 'translate3d(-20px, 0, 0)' },
                delay: 0,
              },
              {
                id: '0cb67c815e8446028860762e52c38ec0',
                isStartState: false,
                styles: { opacity: '1', transform: 'none' },
                delay: 0,
              },
            ],
            delay: 0,
            duration: 30,
            easing: 'cubic-bezier(0, 1.61, 0, 1.15)',
            repeat: false,
            thresholdPercent: 0,
          },
        ],
        component: { name: 'Text', options: { text: 'Enter some text...' } },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            lineHeight: 'normal',
            height: 'auto',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-974cbd96a9df45fb8527a3c987e7facc',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-3cb8a3c70fea46ec99a57b336a66320c',
            animations: [
              {
                trigger: 'pageLoad',
                animation: 'fadeInLeft',
                steps: [
                  {
                    id: '27790e89102547278d5ac057838537f9',
                    isStartState: false,
                    styles: { opacity: '0', transform: 'translate3d(20px, 0, 0)' },
                    delay: 0,
                  },
                  {
                    id: 'b1ac617d3ffa4752a68778117d558e94',
                    isStartState: false,
                    styles: { opacity: '1', transform: 'none' },
                    delay: 0,
                  },
                ],
                delay: 0,
                duration: 30,
                easing: 'cubic-bezier(0, 1.61, 0, 1.15)',
                repeat: false,
                thresholdPercent: 0,
              },
            ],
            component: {
              name: 'Image',
              options: {
                image:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F6a854d9d368a4f4991099f8b79ca22bf',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                lazy: false,
                fitContent: true,
                aspectRatio: 1.243,
                lockAspectRatio: false,
                height: 1300,
                width: 1046,
              },
            },
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                width: '100%',
                minHeight: '20px',
                minWidth: '20px',
                overflow: 'hidden',
              },
            },
          },
        ],
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            height: 'auto',
            paddingBottom: '30px',
            width: '50%',
          },
        },
      },
    ],
  },
};
