export const COUNTDOWN_DATE = 'Thu May 15 2025 01:00:00 GMT-0300 (Atlantic Daylight Time)';

export const COUNTDOWN = {
  data: {
    themeId: false,
    title: 'test-countdown',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-78174ff2f0ce49b58bc65819f10bcea4',
        meta: {
          previousId: 'builder-41d78e7bf5f145029f9711ff45f7f2af',
        },
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              model: 'symbol',
              entry: '448366aa84094a5189c6b7c4adcfca0e',
              data: {
                date: COUNTDOWN_DATE,
              },
              inline: true,
              content: {
                '@version': 3,
                createdBy: 'shieCfdC9fU8HdlCifezfkd29ef1',
                createdDate: 1589513712401,
                data: {
                  cssCode:
                    '.builder-heading-1{font-size:2em;margin:.67em 0}.builder-heading-2{font-size:1.5em;margin:.75em 0}.builder-heading-3{font-size:1.17em;margin:.83em 0}.builder-heading-4,.builder-paragraph{margin:1.12em 0}.builder-heading-5{font-size:.83em;margin:1.5em 0}.builder-heading-6{font-size:.75em;margin:1.67em 0}.builder-heading-1,.builder-heading-2,.builder-heading-3,.builder-heading-4,.builder-heading-5,.builder-heading-6{font-weight:bolder}',
                  inputs: [
                    {
                      '@type': '@builder.io/core:Field',
                      meta: {},
                      name: 'date',
                      type: 'date',
                      defaultValue: 'Sun Dec 31 2023 00:00:00 GMT-0500 (Eastern Standard Time)',
                      required: false,
                      subFields: [],
                      helperText: '',
                      autoFocus: false,
                      simpleTextOnly: false,
                      disallowRemove: false,
                      broadcast: false,
                      bubble: false,
                      hideFromUI: false,
                      hideFromFieldsEditor: false,
                      showTemplatePicker: true,
                      permissionsRequiredToEdit: '',
                      advanced: false,
                      copyOnAdd: true,
                      onChange: '',
                      behavior: '',
                      showIf: '',
                      mandatory: false,
                      hidden: false,
                      noPhotoPicker: false,
                      model: '',
                      supportsAiGeneration: false,
                      defaultCollapsed: false,
                    },
                  ],
                  jsCode:
                    'if(Builder.isBrowser){console.log(state);var second_1=1e3,minute_1=60*second_1,hour_1=60*minute_1,day_1=24*hour_1,countDown_1=new Date(state.date).getTime(),x=setInterval((function(){console.log("updating countdown: ",state.days,state.hours,state.minutes,state.seconds);var t=(new Date).getTime(),e=countDown_1-t;state.days=Math.floor(e/day_1),state.hours=Math.floor(e%day_1/hour_1),state.minutes=Math.floor(e%hour_1/minute_1),state.seconds=Math.floor(e%minute_1/second_1)}),second_1)}',
                  tsCode:
                    "if (Builder.isBrowser){\n   console.log(state)\nconst second = 1000,\n     minute = second * 60,\n     hour = minute * 60,\n     day = hour * 24;\n \nlet countDown = new Date(state.date).getTime(),\n   x = setInterval(function() {   \n \n      console.log('updating countdown: ', state.days, state.hours, state.minutes, state.seconds)\n     let now = new Date().getTime(),\n         distance = countDown - now;\n \n      state.days = Math.floor(distance / (day)),\n      state.hours = Math.floor((distance % (day)) / (hour)),\n      state.minutes = Math.floor((distance % (hour)) / (minute)),\n      state.seconds = Math.floor((distance % (minute)) / second);\n \n   }, second)}",
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      layerName: 'Countdown timer',
                      id: 'builder-fae1d95cc43744b2be2bf0f0d266ed87',
                      component: {
                        name: 'Columns',
                        options: {
                          columns: [
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-9291b10a59ea45d1a08e0aa1cc1313fc',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.days?state.days:"0";return _virtual_index',
                                      },
                                      code: {
                                        bindings: {
                                          'component.options.text': "state.days ? state.days : '0'",
                                        },
                                      },
                                      layerName: 'Days',
                                      id: 'builder-96072992ddad46c59a3e7aa1ae8cfede',
                                      properties: {
                                        id: 'days',
                                      },
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p><br></p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          fontSize: '32px',
                                          flexGrow: '0',
                                          width: 'auto',
                                          alignSelf: 'center',
                                        },
                                      },
                                    },
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      layerName: 'Days text',
                                      id: 'builder-bc689d5841e14421b71c83a57b807645',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Days</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          flexShrink: '0',
                                          position: 'relative',
                                          marginTop: '10px',
                                          textAlign: 'center',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          width: 'auto',
                                          alignSelf: 'center',
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
                                      height: 'auto',
                                      paddingBottom: '0px',
                                      paddingLeft: '20px',
                                      paddingRight: '20px',
                                      width: 'auto',
                                      alignSelf: 'center',
                                      borderRight: '1px solid #d3d3d3',
                                    },
                                    medium: {
                                      borderRight: 'none',
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-2334a79e203648ec8d6e810f8bf75f66',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.hours?state.hours:"0";return _virtual_index',
                                      },
                                      code: {
                                        bindings: {
                                          'component.options.text':
                                            "state.hours ? state.hours : '0'",
                                        },
                                      },
                                      layerName: 'Hours',
                                      id: 'builder-e7d86cede2174afd9ef1473446e94200',
                                      properties: {
                                        id: 'hours',
                                      },
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p><br></p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          fontSize: '32px',
                                          flexGrow: '0',
                                          width: 'auto',
                                          alignSelf: 'center',
                                        },
                                      },
                                    },
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      layerName: 'Hours text',
                                      id: 'builder-196a55a59b8d4a72b991c235df098c11',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Hours</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          flexShrink: '0',
                                          position: 'relative',
                                          marginTop: '10px',
                                          textAlign: 'center',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          width: 'auto',
                                          alignSelf: 'center',
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
                                      height: 'auto',
                                      paddingLeft: '20px',
                                      paddingRight: '20px',
                                      borderRight: '1px solid #d3d3d3',
                                    },
                                    medium: {
                                      borderRight: 'none',
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-3e9355850dce4cee8425bf01b8617702',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.minutes?state.minutes:"0";return _virtual_index',
                                      },
                                      code: {
                                        bindings: {
                                          'component.options.text':
                                            "state.minutes ? state.minutes : '0'",
                                        },
                                      },
                                      layerName: 'Minutes',
                                      id: 'builder-402b3377b7464b45946678f6eec35cc5',
                                      properties: {
                                        id: 'minutes',
                                      },
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p><br></p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          fontSize: '32px',
                                          flexGrow: '0',
                                          width: 'auto',
                                          alignSelf: 'center',
                                        },
                                      },
                                    },
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      layerName: 'Minutes text',
                                      id: 'builder-6d899c8f7cf748759ab7cab878f57e4e',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Minutes</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          flexShrink: '0',
                                          position: 'relative',
                                          marginTop: '10px',
                                          textAlign: 'center',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          width: 'auto',
                                          alignSelf: 'center',
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
                                      height: 'auto',
                                      paddingLeft: '20px',
                                      paddingRight: '20px',
                                      borderRight: '1px solid #d3d3d3',
                                    },
                                    medium: {
                                      borderRight: 'none',
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  id: 'builder-8bfc4f0f99dc4239acf69c181af2f9d7',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.seconds?state.seconds:"0";return _virtual_index',
                                      },
                                      code: {
                                        bindings: {
                                          'component.options.text':
                                            "state.seconds ? state.seconds : '0'",
                                        },
                                      },
                                      layerName: 'Seconds',
                                      id: 'builder-74c509cbd53a452cb18c0c21dae9fddb',
                                      properties: {
                                        id: 'seconds',
                                      },
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p><br></p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          fontSize: '32px',
                                          flexGrow: '0',
                                          width: 'auto',
                                          alignSelf: 'center',
                                        },
                                      },
                                    },
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      layerName: 'Seconds text',
                                      id: 'builder-39d338ca716a4d86a695d9f45c96c0eb',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Seconds</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'stretch',
                                          flexShrink: '0',
                                          position: 'relative',
                                          marginTop: '10px',
                                          textAlign: 'center',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          width: 'auto',
                                          alignSelf: 'center',
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
                                      height: 'auto',
                                      paddingLeft: '20px',
                                      paddingRight: '20px',
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                          space: 0,
                          stackColumnsAt: 'tablet',
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
                          width: 'auto',
                          alignSelf: 'center',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
          },
        },
      },
    ],
    inputs: [],
  },
};
