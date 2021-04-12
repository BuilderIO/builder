import React from 'react';
import { MemsourceConnector } from '../src/plugin';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/';
import axios from 'axios';

jest.mock('@material-ui/core/Checkbox', () => (props: any) => {
  return (
    <input
      type="checkbox"
      name={props.name}
      onChange={props.onChange}
      data-testid={props['data-testid']}
      value={props.name}
    />
  );
});

describe('Memsource connector', () => {
  describe('When rendering', () => {
    it('react displays LOCALIZE button', () => {
      const { getByTestId } = render(<MemsourceConnector />);

      expect(getByTestId('button-localise')).toBeVisible();
    });
  });

  describe('Having clicked on LOCALIZE button', () => {
    describe('Given builder context has not enough configuration for the dialog to show', () => {
      it('Then a warning alert should display when page has no blocks', () => {
        const { getByTestId } = render(<MemsourceConnector />);

        fireEvent.click(getByTestId('button-localise'));

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Page has no blocks'
        );
      });

      it('Then a warning alert should display when page locale is not eligible to be localised from', () => {
        const ctx = {
          designerState: {
            editingContentModel: {
              data: {
                get: (arg: string) => ({ blocks: { toJSON: () => [{}] } }[arg]),
                toJSON: () => ({ locale: 'unallowed-locale-1' })
              },
              model: {
                fields: [
                  {
                    name: 'allowedLocales',
                    enum: { toJSON: () => ['allowed-1', 'allowed-2'] }
                  }
                ]
              }
            }
          }
        };
        const { getByTestId } = render(<MemsourceConnector context={ctx} />);

        fireEvent.click(getByTestId('button-localise'));

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Current locale not allowed to be localised from'
        );
      });

      it('Then a warning alert should display when model has only one locale', () => {
        const ctx = {
          designerState: {
            editingContentModel: {
              data: {
                get: (arg: string) => ({ blocks: { toJSON: () => [{}] } }[arg])
              }
            }
          }
        };
        const { getByTestId } = render(<MemsourceConnector context={ctx} />);

        fireEvent.click(getByTestId('button-localise'));

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Model has only one locale'
        );
      });

      it('Then a warning alert should display when model has no memsource proxy url', () => {
        const ctx = {
          designerState: {
            editingContentModel: {
              data: {
                get: (arg: string) => ({ blocks: { toJSON: () => [{}] } }[arg]),
                toJSON: () => ({ locale: 'locale-1' })
              },
              model: {
                fields: [
                  {
                    name: 'locale',
                    enum: { toJSON: () => ['locale-1', 'locale-2'] }
                  }
                ]
              }
            }
          }
        };
        const { getByTestId } = render(<MemsourceConnector context={ctx} />);

        fireEvent.click(getByTestId('button-localise'));

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Model has no memsourceProxyUrl set'
        );
      });
    });

    describe('Given payload can be built', () => {
      const ctx = {
        user: {
          data: {
            email: 'it-was-I-who-requested-translations@org.com'
          }
        },
        designerState: {
          editingContentModel: {
            modelName: 'model-name',
            id: 'page-id',
            name: 'page-name',
            meta: {
              get: (arg: string) =>
                ({ componentsUsed: { toJSON: () => [] } }[arg])
            },
            data: {
              get: (arg: string) =>
                ({
                  blocks: {
                    toJSON: () => [
                      {
                        toJSON: () => ({})
                      }
                    ]
                  }
                }[arg]),
              toJSON: () => ({ locale: 'locale-1', title: 'page-title' })
            },
            model: {
              name: 'model-name',
              fields: [
                {
                  name: 'locale',
                  toJSON: () => ({
                    name: 'locale',
                    enum: { toJSON: () => ['locale-1', 'locale-2'] }
                  }),
                  enum: { toJSON: () => ['locale-1', 'locale-2'] }
                },
                {
                  name: 'memsourceProxyUrl',
                  toJSON: () => ({ defaultValue: 'http://example.com' })
                }
              ]
            }
          }
        }
      };
      it('Then localisation dialog is displayed', () => {
        const { getByTestId, getByText } = render(
          <MemsourceConnector context={ctx} />
        );

        fireEvent.click(getByTestId('button-localise'));

        expect(getByTestId('localisation-dialog')).toBeVisible();
        expect(getByText(/Source locale:/)).toBeVisible();
        expect(getByText(/locale-1/)).toBeVisible();
        expect(getByText(/Target locales:/)).toBeVisible();
        expect(getByText(/locale-2/)).toBeVisible();
        expect(getByTestId('dialog-form-submit-button')).toBeDisabled();
      });

      describe('When clicking on a target locale', () => {
        it('Then submit button is enabled', () => {
          const { getByTestId } = render(<MemsourceConnector context={ctx} />);

          fireEvent.click(getByTestId('button-localise'));
          fireEvent.click(getByTestId('locale-2-checkbox'));

          expect(getByTestId('dialog-form-submit-button')).toBeEnabled();
        });
      });

      describe('When clicking on the submit button', () => {
        it('Then a POST request is fired', () => {
          const spy = jest.fn();
          jest
            .spyOn(axios, 'post')
            .mockImplementationOnce((...args) => spy(...args));

          const { getByTestId } = render(<MemsourceConnector context={ctx} />);

          fireEvent.click(getByTestId('button-localise'));
          fireEvent.click(getByTestId('locale-2-checkbox'));
          fireEvent.click(getByTestId('dialog-form-submit-button'));

          expect(spy).toHaveBeenCalledWith('http://example.com', {
            proxy: {
              projectName: 'Builderio__model-name__page-title__locale-1',
              sourceLocale: 'locale-1',
              targetLocales: ['locale-2'],
              payload: {
                __context: expect.objectContaining({
                  locale: 'locale-1',
                  modelName: 'model-name',
                  pageId: 'page-id',
                  pageName: 'page-name',
                  title: 'page-title',
                  requestor: 'it-was-I-who-requested-translations@org.com'
                }),
                content: expect.anything()
              }
            }
          });
        });

        it('Then sends each translatable in an key-value pair structure', () => {
          const spy = jest.fn();
          jest
            .spyOn(axios, 'post')
            .mockImplementationOnce((...args) => spy(...args));

          const listBlock = givenListBlock({
            id: 'list-1',
            items: ['list item 1', 'list item 2']
          });
          const textBlock = givenTextBlock({
            id: 'text-1',
            text: 'text content'
          });

          ctx.designerState.editingContentModel.data.get = (arg) => {
            return {
              blocks: {
                toJSON: () => [listBlock, textBlock]
              }
            }[arg];
          };

          ctx.designerState.editingContentModel['componentsUsed'] = {
            list: { name: 'list', inputs: [{ name: 'list', type: 'list' }] },
            text: { name: 'text', inputs: [{ name: 'text', type: 'longText' }] }
          };

          const { getByTestId } = render(<MemsourceConnector context={ctx} />);

          fireEvent.click(getByTestId('button-localise'));
          fireEvent.click(getByTestId('locale-2-checkbox'));
          fireEvent.click(getByTestId('dialog-form-submit-button'));

          expect(spy).toHaveBeenCalledWith('http://example.com', {
            proxy: expect.objectContaining({
              payload: expect.objectContaining({
                content: [
                  {
                    __id: 'list-1',
                    __optionKey: 'list',
                    __listIndex: 0,
                    toTranslate: 'list item 1'
                  },
                  {
                    __id: 'list-1',
                    __optionKey: 'list',
                    __listIndex: 1,
                    toTranslate: 'list item 2'
                  },
                  {
                    __id: 'text-1',
                    __optionKey: 'text',
                    toTranslate: 'text content'
                  }
                ]
              })
            })
          });
        });
      });
    });
  });
});

const givenListBlock = ({ id, items }) => {
  return {
    name: 'list',
    id,
    options: {
      list: items.map((item: string) => ({ item }))
    },
    toJSON: () => ({
      id,
      component: {
        name: 'list',
        options: {
          list: items.map((item: string) => ({ item }))
        }
      }
    })
  };
};

const givenTextBlock = ({ id, text }) => {
  return {
    name: 'text',
    id,
    options: {
      text
    },
    toJSON: () => ({
      id,
      component: {
        name: 'text',
        options: {
          text
        }
      }
    })
  };
};
