import {
  withBuilder,
  BuilderStoreContext,
  BuilderBlockComponent,
  Builder,
} from '@builder.io/react';
import * as React from 'react';
import { FormBlockProps } from '../interfaces/component-props';

export function FormBlock(props: FormBlockProps) {
  const { type, builderState, parameter, customAttributes, builderBlock, showErrors } = props;
  let form: any = {};
  let formAttributes: any = {
    method: 'post',
    acceptCharset: 'UTF-8',
  };

  // This looks for a global variable that we have server rendered by Shopify.
  // The goal is to get the Shopify form object and allow anything that needs data from
  // that form object to get it from the Builder state. https://shopify.dev/docs/themes/liquid/reference/objects/form
  if (Builder.isBrowser && (window as any).BuilderShopifyData && builderBlock?.id) {
    const formData = (window as any).BuilderShopifyData[builderBlock.id]?.form;

    if (formData) {
      Object.assign(form, formData);
    }
  }

  // Specific logic for each type of form tag, from https://shopify.dev/docs/themes/liquid/reference/tags/theme-tags#form
  if (type === 'activate_customer_password') {
    formAttributes.action = '/account/activate';
  } else if (type === 'contact') {
    formAttributes.action = '/contact#contact_form';
    formAttributes.id = 'contact_form';
    formAttributes.className = 'contact-form';
  } else if (type === 'currency') {
    formAttributes.action = '/cart/update';
    formAttributes.id = 'currency_form';
    formAttributes.encType = 'multipart/form-data';
    formAttributes.className = 'shopify-currency-form';
  } else if (type === 'customer') {
    formAttributes.action = '/contact#contact_form';
    formAttributes.id = 'contact_form';
    formAttributes.className = 'contact-form';
  } else if (type === 'create_customer') {
    formAttributes.action = '/account';
    formAttributes.id = 'create_customer';
  } else if (type === 'customer_address') {
    formAttributes.action = '/account/addresses';
    formAttributes.id = 'address_form_new';
  } else if (type === 'customer_login') {
    formAttributes.action = '/account/login';
  } else if (type === 'guest_login') {
    formAttributes.action = '/account/login';
    formAttributes.id = 'customer_login_guest';
  } else if (type === 'product') {
    const product = builderState?.context.shopify.liquid.get(parameter, builderState.state);
    formAttributes.action = '/cart/add';
    formAttributes.id = `product_form_${product?.id}`;
    formAttributes.className = 'shopify-product-form';
    formAttributes.encType = 'multipart/form-data';
  } else if (type === 'recover_customer_password') {
    formAttributes.action = '/account/recover';
  } else if (type === 'reset_customer_password') {
    formAttributes.action = '/account/reset';
  } else if (type === 'storefront_password') {
    formAttributes.action = '/password';
    formAttributes.id = 'login_form';
    formAttributes.className = 'storefront-password-form';
  } else if (type === 'new_comment') {
    formAttributes.action = '/blogs/news/my-blog-post/comments#comment_form';
    formAttributes.id = 'comment_form';
    formAttributes.className = 'comment-form';
  }

  if (customAttributes?.length) {
    customAttributes.forEach(attribute => {
      const [key, value] = attribute.split(':');
      let useValue = value?.trim();

      if (useValue && builderState?.state) {
        useValue = builderState.context.shopify.liquid.render(
          `{{${useValue}}}`,
          builderState.state
        );
      }

      if (key === 'class' && formAttributes.className && useValue) {
        formAttributes.className = `${formAttributes.className} ${useValue?.trim() || ''}`;
      } else if (useValue) {
        formAttributes[key] = useValue;
      } else if (key && !useValue) {
        // This is an attribute that does not have a value but should be added to the attribute list (e.g. boolean attribute)
        formAttributes[key] = true;
      }
    });
  }

  return (
    <BuilderStoreContext.Consumer>
      {store => (
        <BuilderStoreContext.Provider
          value={{
            ...store,
            state: {
              ...store.state,
              form,
            },
          }}
        >
          <form {...formAttributes}>
            <input type="hidden" name="form_type" value={type} />
            <input type="hidden" name="utf8" value="✓" />
            {type === 'currency' && (
              <input
                type="hidden"
                name="return_to"
                value={builderState?.state?.location?.pathname}
              />
            )}
            {showErrors && form?.errors && <span>{form.errors}</span>}
            {type === 'guest_login' && <input type="hidden" name="guest" value="true" />}
            {props.builderBlock?.children?.map(item => (
              <BuilderBlockComponent block={item} key={item.id} />
            ))}
          </form>
        </BuilderStoreContext.Provider>
      )}
    </BuilderStoreContext.Consumer>
  );
}

withBuilder(FormBlock, {
  name: 'Shopify:Form',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'type',
      type: 'string',
    },
    {
      name: 'parameter',
      type: 'string',
    },
    {
      name: 'customAttributes',
      type: 'array',
    },
  ],
});
