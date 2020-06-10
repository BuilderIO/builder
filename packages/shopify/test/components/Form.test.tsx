import { render } from '@testing-library/react';
import * as React from 'react';
import { FormBlock } from '../../react/components/Form';
import { mockStateWithShopify } from '../modules/helpers';
import * as reactTestRenderer from 'react-test-renderer';

describe('Form', () => {
  test('Basic contact form creation', () => {
    const ref = render(
      <FormBlock
        type="contact"
        customAttributes={['class: product_class_name', "data-testid: 'form-block-1'"]}
        builderState={mockStateWithShopify({
          product_class_name: 'product-test-class-1',
        })}
      />
    );
    expect(ref.queryByTestId('form-block-1')).toBeTruthy();
    expect(ref.container.querySelector('#contact_form')).toBeTruthy();
  });

  it('renders contact form snapshot correctly', () => {
    const tree = reactTestRenderer
      .create(
        <FormBlock
          type="contact"
          customAttributes={['class: product_class_name', "data-testid: 'form-block-1'"]}
          builderState={mockStateWithShopify({
            product_class_name: 'product-test-class-1',
          })}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Basic product form creation', () => {
    const ref = render(
      <FormBlock
        type="product"
        parameter="product"
        customAttributes={['class: product_class_name', "data-testid: 'form-block-2'"]}
        builderState={mockStateWithShopify({
          product_class_name: 'product-test-class-1',
          product: {
            id: 123,
          },
        })}
      />
    );
    expect(ref.queryByTestId('form-block-2')).toBeTruthy();
    expect(ref.container.querySelector('#product_form_123')).toBeTruthy();
    expect(ref.container.querySelector('.shopify-product-form')).toBeTruthy();
    expect(ref.container.querySelector('[action="/cart/add"')).toBeTruthy();
    expect(ref.container.querySelector('[enctype="multipart/form-data"')).toBeTruthy();
  });

  it('renders product form snapshot correctly', () => {
    const tree = reactTestRenderer
      .create(
        <FormBlock
          type="product"
          parameter="product"
          customAttributes={['class: product_class_name', "data-testid: 'form-block-2'"]}
          builderState={mockStateWithShopify({
            product_class_name: 'product-test-class-1',
            product: {
              id: 123,
            },
          })}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Basic storefront password form creation', () => {
    const ref = render(
      <FormBlock
        type="storefront_password"
        customAttributes={['class: password_form_class', "data-testid: 'form-block-password'"]}
        builderState={mockStateWithShopify({
          password_form_class: 'password-class',
        })}
      />
    );
    expect(ref.queryByTestId('form-block-password')).toBeTruthy();
    expect(ref.container.querySelector('#login_form')).toBeTruthy();
  });

  it('renders storefront password form snapshot correctly', () => {
    const tree = reactTestRenderer
      .create(
        <FormBlock
          type="storefront_password"
          customAttributes={['class: password_form_class', "data-testid: 'form-block-password'"]}
          builderState={mockStateWithShopify({
            password_form_class: 'password-class',
          })}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Basic currency form creation', () => {
    const ref = render(
      <FormBlock
        type="currency"
        customAttributes={['class: currency_form_class', "data-testid: 'form-block-currency'"]}
        builderState={mockStateWithShopify({
          currency_form_class: 'currency-class',
          location: {
            pathname: '/some-path',
          },
        })}
      />
    );
    expect(ref.queryByTestId('form-block-currency')).toBeTruthy();
    expect(ref.container.querySelector('#currency_form')).toBeTruthy();
    expect(ref.container.querySelector('[enctype="multipart/form-data"')).toBeTruthy();
    expect(ref.container.querySelector('[action="/cart/update"')).toBeTruthy();
  });

  it('renders currency form snapshot correctly', () => {
    const tree = reactTestRenderer
      .create(
        <FormBlock
          type="currency"
          customAttributes={['class: currency_form_class', "data-testid: 'form-block-currency'"]}
          builderState={mockStateWithShopify({
            currency_form_class: 'currency-class',
            location: {
              pathname: '/some-path',
            },
          })}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('handles form object from window correctly', () => {
    (window as any).BuilderShopifyData = {
      '1235': {
        form: {
          id: 1765,
          errors: ['form', 'other-error'],
        },
      },
    };
    const tree = reactTestRenderer
      .create(
        <FormBlock
          type="currency"
          customAttributes={["data-testid: 'form-block-currency'"]}
          showErrors={true}
          builderBlock={{
            '@type': '@builder.io/sdk:Element',
            id: '1235',
          }}
          builderState={mockStateWithShopify({
            currency_form_class: 'currency-class',
          })}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
