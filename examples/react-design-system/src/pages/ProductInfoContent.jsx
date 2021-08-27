import styled from "styled-components";
import React from 'react'

/*
<div style={{ display: 'flex', flexDirection: 'column', padding: 50 }}>
      <div style={{ margin: '0 auto', maxWidth: 1200, width: '100%' }}>
        {product == null ? (
          <div
            style={{
              display: 'flex',
              padding: 100,
              justifyContent: 'center',
            }}
          >
            <CircularProgress disableShrink color="inherit" />
          </div>
        ) : product.errorCode ? (
          <div style={{ padding: 100, textAlign: 'center', color: '#666' }}>Product not found</div>
        ) : (
          <div>
            <div style={{ display: 'flex', position: 'relative', alignItems: 'flex-start' }}>
              <div style={{ width: '50%', flexShrink: 0, textAlign: 'center',  }}>
                {item.images
                .slice(0, props.size === 'small' ? 1 : 2).map(image => 
                  <img
                    style={{
                      display: 'block',
                      padding: 5,
                      objectFit: 'contain',
                      width: '100%',
                      maxHeight: 800,
                    }}
                    src={image.imageUrl}
                  />
                )}
              </div>
              <div style={{ marginLeft: 50, position: 'sticky', top: 50 }}>
                <h2>{item.name}</h2>
                <h3>${price}.00</h3>
                <p>{product.description}</p>
                <Button href={seller.addToCartLink} variant="outlined" size="large" style={{ marginTop: 10 }} fullWidth>
                  Add to bag
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    */

export function ProductInfoContent(props) {
  const { product, price, seller, item } = props;
  return (
    <>
      <Div>
        <Div2>
          <Div3>
            <Div4 data-slider='{"presetConfig":"productDetailImageSliderOptions"}'>
              <Button type="button">Previous</Button>
              <Div5 aria-live="polite">
                <Div6 role="listbox">
                  <A
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="-1"
                    aria-hidden="true"
                    tabindex="-1"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?$zoom$"
                  >
                    <Span>
                      <RawImg1
                        alt="View Larger Image of Heart and Vine Ring"
                        src={item.images[0]?.imageUrl}
                        height={528}
                        width={528}
                      />
                    </Span>
                  </A>
                  {/* <a
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="0"
                    aria-hidden="false"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide00"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?$zoom$"
                  >
                    <span>
                      <RawImg2
                        alt="View Larger Image of Heart and Vine Ring"
                        src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?$detail_wide_1x$"
                        height={528}
                        width={528}
                      />
                    </span>
                  </a>
                  <a
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="1"
                    aria-hidden="true"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide01"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_altS?$zoom$"
                  >
                    <span>
                      <img                        alt="View Larger Image of Heart and Vine Ring"
                        src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_altS?$detail_wide_1x$"
                        height={528}
                        width={528}
                      />
                    </span>
                  </a>
                  <a
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="2"
                    aria-hidden="true"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide02"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_IGC?$zoom$"
                  >
                    <span>
                      <img                        alt="View Larger Image of Heart and Vine Ring"
                        src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_IGC?$detail_wide_1x$"
                        height={528}
                        width={528}
                      />
                    </span>
                  </a>
                  <a
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="3"
                    aria-hidden="true"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide03"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?$zoom$"
                  >
                    <span>
                      <img
                        alt="View Larger Image of Heart and Vine Ring"
                        src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?$detail_wide_1x$"
                        height={528}
                        width={528}
                      />
                    </span>
                  </a>
                  <a
                    target="_blank"
                    data-zoom-button='{"alt":"Heart and Vine Ring"}'
                    data-slick-index="4"
                    aria-hidden="true"
                    tabindex="-1"
                    href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?$zoom$"
                  >
                    <span>
                      <RawImg6
                        alt="View Larger Image of Heart and Vine Ring"
                        src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?$detail_wide_1x$"
                        height={528}
                        width={528}
                      />
                    </span>
                  </a>
                 */}
                </Div6>
              </Div5>
              <Div7>
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  code='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="svg-icon svg-icon--light-gray svg-icon--product-details-zoom" style="   fill: rgb(183, 191, 204);   height: 24px;   width: 24px;   display: inline-block;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>View Larger Image of %{product_name}</title><path d="M14.7 13L11 9.4c.7-1 1-2.1 1-3.3 0-3.3-2.7-6-6-6C2.7 0 0 2.7 0 6c0 3.3 2.7 6 6 6 1.2 0 2.4-.4 3.4-1l3.6 3.6c.5.5 1.2.5 1.6 0 .5-.4.5-1.1.1-1.6zM6 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"></path><path d="M6.6 7.6v-1h1c.3 0 .6-.2.6-.6 0-.3-.2-.6-.6-.6h-1v-1c0-.4-.3-.6-.6-.6-.4 0-.6.2-.6.6v1h-1c-.4 0-.6.3-.6.6s.3.6.6.6h1v1c0 .3.3.6.6.6s.6-.3.6-.6z"></path></svg>'
                />
              </Div7>
              <Div8>
                <Div9>
                  <Ul>
                    <Li>
                      <A7
                        target="_blank"
                        data-popup-button=""
                        data-analytics='{"event":"share","domEvent":"click","payload":{"type":"facebook","url":"https://www.jamesavery.com/products/heart-and-vine-ring"}}'
                        href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.jamesavery.com%2Fproducts%2Fheart-and-vine-ring"
                      >
                        <Svg2
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          code='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Share on Facebook</title><path d="M6.488 16h3.128V8.006h2.11L12 5.181H9.616v-1.66c0-.625.39-.77.663-.77h1.682V.01L9.644 0C7.072 0 6.488 2.045 6.488 3.354V5.18H5v2.825h1.488V16z"></path></svg>'
                        />
                      </A7>
                    </Li>
                    <li>
                      <A8
                        target="_blank"
                        data-popup-button=""
                        data-analytics='{"event":"share","domEvent":"click","payload":{"type":"twitter","url":"https://www.jamesavery.com/products/heart-and-vine-ring"}}'
                        href="https://twitter.com/intent/tweet?text=Check+out+Heart+and+Vine+Ring+from+James+Avery&url=https%3A%2F%2Fwww.jamesavery.com%2Fproducts%2Fheart-and-vine-ring"
                      >
                        <Svg3
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          code='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Tweet on Twitter</title><path d="M14.115 4.056a3.288 3.288 0 0 0 1.443-1.816 6.572 6.572 0 0 1-2.084.797A3.28 3.28 0 0 0 11.078 2 3.282 3.282 0 0 0 7.88 6.03 9.319 9.319 0 0 1 1.114 2.6 3.276 3.276 0 0 0 .67 4.25a3.28 3.28 0 0 0 1.46 2.732 3.276 3.276 0 0 1-1.487-.41v.041a3.285 3.285 0 0 0 2.633 3.218 3.285 3.285 0 0 1-1.482.057 3.287 3.287 0 0 0 3.065 2.28A6.586 6.586 0 0 1 0 13.526 9.302 9.302 0 0 0 5.033 15c6.037 0 9.339-5 9.339-9.338 0-.142-.004-.283-.01-.425A6.674 6.674 0 0 0 16 3.54a6.574 6.574 0 0 1-1.885.517z"></path></svg>'
                        />
                      </A8>
                    </li>
                    <li>
                      <A9
                        target="_blank"
                        data-popup-button=""
                        data-analytics='{"event":"share","domEvent":"click","payload":{"type":"pinterest","url":"https://www.jamesavery.com/products/heart-and-vine-ring"}}'
                        href="https://pinterest.com/pin/create/button/?description=Check+out+Heart+and+Vine+Ring+from+James+Avery&media=https%3A%2F%2Fjamesavery.scene7.com%2Fis%2Fimage%2FJamesAvery%2FRG-2018-670388%3Fop_sharpen%3D1%26size%3D400.0%252C350.0%26wid%3D350%26xmpembed%3D1&url=https%3A%2F%2Fwww.jamesavery.com%2Fproducts%2Fheart-and-vine-ring"
                      >
                        <Svg4
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          code='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Pin it on Pinterest</title><path d="M3.882 9.252c.21.086.399.003.46-.23.042-.161.143-.568.188-.737.061-.231.037-.312-.133-.512-.37-.437-.606-1.003-.606-1.803 0-2.322 1.738-4.402 4.525-4.402 2.467 0 3.824 1.508 3.824 3.522 0 2.65-1.173 4.887-2.914 4.887-.962 0-1.681-.795-1.45-1.77.276-1.165.81-2.422.81-3.262 0-.752-.403-1.38-1.239-1.38-.983 0-1.772 1.018-1.772 2.38 0 .867.293 1.454.293 1.454l-1.182 5.008c-.351 1.486-.053 3.308-.027 3.492.014.11.154.135.218.052.09-.118 1.261-1.563 1.659-3.007.112-.408.646-2.526.646-2.526.32.61 1.253 1.145 2.245 1.145 2.955 0 4.96-2.693 4.96-6.298 0-2.726-2.31-5.265-5.82-5.265C4.203 0 2 3.13 2 5.741c0 1.581.598 2.987 1.882 3.511z"></path></svg>'
                        />
                      </A9>
                    </li>
                    <li>
                      <A10
                        rel="nofollow"
                        title="Share by Email"
                        data-dialog-button=""
                        data-analytics='{"event":"share","domEvent":"click","payload":{"type":"email","url":"https://www.jamesavery.com/products/heart-and-vine-ring"}}'
                        href="https://www.jamesavery.com/shares/new?title=Check+out+Heart+and+Vine+Ring+from+James+Avery&url=https%3A%2F%2Fwww.jamesavery.com%2Fproducts%2Fheart-and-vine-ring"
                      >
                        <Svg5
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 44 44"
                          code='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 20px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 20px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Share by Email</title><path d="M22 4.9L1.7 16.7v19.9c0 1.3 1.1 2.4 2.4 2.4h35.7c1.3 0 2.4-1.1 2.4-2.4V16.7L22 4.9zm17.9 12.3L22 27.6 4.1 17.2 22 6.8l17.9 10.4z"></path></svg>'
                        />
                      </A10>
                    </li>
                  </Ul>
                </Div9>
              </Div8>
              <Button2 type="button">Next</Button2>
            </Div4>
            <Div10 data-slider='{"presetConfig":"productAlternateImageSliderOptions","slidesToShow":4}'>
              <Div11 aria-live="polite">
                <Div12 role="listbox">
                 {item.images.map(image => {
                   return  <Div13
                   data-slick-index="0"
                   aria-hidden="false"
                   tabindex="-1"
                   role="option"
                   aria-describedby="slick-slide10"
                 >
                   <A11
                     target="_blank"
                     data-alternate-image-button='{"src":"https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?op_sharpen=1\u0026size=400.0%2C350.0\u0026wid=350\u0026xmpembed=1"}'
                     tabindex="0"
                   >
                       <RawImg7
                         alt="View Larger Image of Heart and Vine Ring"
                         src={image.imageUrl}
                         height={62}
                         width={62}
                       />
                   </A11>
                 </Div13>
                 }
                  )}
                  {/* <Div14
                    data-slick-index="1"
                    aria-hidden="false"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide11"
                  >
                    <A12
                      target="_blank"
                      data-alternate-image-button='{"src":"https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_altS?op_sharpen=1\u0026size=400.0%2C350.0\u0026wid=350\u0026xmpembed=1"}'
                      tabindex="0"
                      href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_altS?$zoom$"
                    >
                      <Span8>
                        <RawImg8
                          alt="View Larger Image of Heart and Vine Ring"
                          src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_altS?$detail_alt_wide_1x$"
                          height={62}
                          width={62}
                        />
                      </Span8>
                    </A12>
                  </Div14>
                  <Div15
                    data-slick-index="2"
                    aria-hidden="false"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide12"
                  >
                    <A13
                      target="_blank"
                      data-alternate-image-button='{"src":"https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_IGC?op_sharpen=1\u0026size=400.0%2C350.0\u0026wid=350\u0026xmpembed=1"}'
                      tabindex="0"
                      href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_IGC?$zoom$"
                    >
                      <Span9>
                        <RawImg9
                          alt="View Larger Image of Heart and Vine Ring"
                          src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_IGC?$detail_alt_wide_1x$"
                          height={62}
                          width={62}
                        />
                      </Span9>
                    </A13>
                  </Div15>
                  <Div16
                    data-slick-index="3"
                    aria-hidden="false"
                    tabindex="-1"
                    role="option"
                    aria-describedby="slick-slide13"
                  >
                    <A14
                      target="_blank"
                      data-alternate-image-button='{"src":"https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?op_sharpen=1\u0026size=400.0%2C350.0\u0026wid=350\u0026xmpembed=1"}'
                      tabindex="0"
                      href="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?$zoom$"
                    >
                      <Span10>
                        <RawImg10
                          alt="View Larger Image of Heart and Vine Ring"
                          src="https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388_rul?$detail_alt_wide_1x$"
                          height={62}
                          width={62}
                        />
                      </Span10>
                    </A14>
                  </Div16> */}
                </Div12>
              </Div11>
            </Div10>
          </Div3>
        </Div2>
        <Div17 style={{ fontFamily: 'Avenir' }}>
          <Div18>
            <Div19>{item.name}</Div19>
            <Div20>
              <Div21 itemscope="">
                <P2 data-current-price="">
                  ${price}.00
                </P2>
              </Div21>
              <P3>Select your options to see final price</P3>
            </Div20>
            <Form
              data-drawer-form='{"drawerOptions":{"edge":"right","cssClass":"drawer--cart drawer--cart-new-item"}}'
              data-analytics='{"event":"addToCart","domEvent":"submit","payload":{"id":"RG-2018","name":"Heart and Vine Ring","brand":"James Avery","sku":null,"sale":false,"price":"42.00","category":"New Jewelry for Summer"}}'
              action="/cart/items"
              accept-charset="UTF-8"
              method="post"
              novalidate="novalidate"
            >
              <Input name="utf8" type="hidden" value="✓" />
              <input
                type="hidden"
                name="authenticity_token"
                value="dKd7jm3GofOJw/N710F3CABRWJSz5LvKcz8rcNdylcSDUehQcsLV2XGoHPOAAglcNr90cdaWQFgxD2ErNAc6XQ=="
              />
              <input type="hidden" name="product_id" value="RG-2018" />
              <input type="hidden" name="sku" />
              <div>
                <div>
                  <Div22>
                    <Label for="metal_catalog_product_RG-2018">
                      Select a Metal: Sterling Silver
                    </Label>
                    <ul style={{ paddingInlineStart: 0 }}>
                      <Li5>
                        <A15
                          title="Sterling Silver"
                          data-ja-option-button="metal"
                          data-ja-option-button-selection="Sterling Silver"
                          href="https://www.jamesavery.com/products/heart-and-vine-ring?via=Z2lkOi8vamFtZXNhdmVyeS9Xb3JrYXJlYTo6Q2F0YWxvZzo6Q2F0ZWdvcnkvNTk5NTAwOTI2MTcwNzAzYWUyMDAwMDA4#"
                        >
                          <RawImg11
                            alt="Sterling Silver"
                            src="https://jamesavery.scene7.com/is/image/JamesAvery/swatch_SS?hei=170&op_sharpen=1&size=170.0%2C170.0&wid=170"
                            height={30}
                            width={30}
                          />
                        </A15>
                      </Li5>
                    </ul>
                    <Input5
                      type="text"
                      name="metal"
                      value="Sterling Silver"
                      data-product-details-sku-select="heart-and-vine-ring"
                      required="required"
                      aria-labelledby="label_for_metal_catalog_product_RG-2018"
                    />
                  </Div22>
                  <Div23>
                    <label for="size_catalog_product_RG-2018">
                      Select a Size:
                    </label>
                    <div>
                      <Div24>
                        <Select
                          name="size"
                          required="required"
                          data-product-details-sku-select="heart-and-vine-ring"
                          data-store-inventory-check-trigger='{"endpoint":"/products/heart-and-vine-ring/inventory"}'
                          data-engraving-url-refresh-trigger=""
                        >
                          <option value="">Select Size</option>
                          <option value="4.0">4.0</option>
                          <option value="4.5">4.5</option>
                          <option value="5.0">5.0</option>
                          <option value="5.5">5.5</option>
                          <option value="6.0">6.0</option>
                          <option value="6.5">6.5</option>
                          <option value="7.0">7.0</option>
                          <option value="7.5">7.5</option>
                          <option value="8.0">8.0</option>
                          <option value="8.5">8.5</option>
                          <option value="9.0">9.0</option>
                          <option value="9.5">9.5</option>
                          <option value="10.0">10.0</option>
                        </Select>
                      </Div24>
                    </div>
                  </Div23>
                </div>
                <Div25>
                  <P4>Personalization Options</P4>
                  <P5>
                    Express yourself by adding charms or engraving with our fun
                    interactive tool. Additional business days required for
                    assembly and delivery.
                  </P5>
                  <Button3
                    name="button"
                    type="button"
                    data-product-details-personalization-button='{"engraving":false,"types":{"RG-2018-121510":["laser"],"RG-2018-385984":["laser"],"RG-2018-961844":["laser"],"RG-2018-738432":["laser"],"RG-2018-828964":["laser"],"RG-2018-770330":["laser"],"RG-2018-670388":["laser"],"RG-2018-625966":["laser"],"RG-2018-997210":["laser"],"RG-2018-425697":["laser"],"RG-2018-972171":["laser"],"RG-2018-412675":["laser"],"RG-2018-538591":["laser"]},"product_image":"https://jamesavery.scene7.com/is/image/JamesAvery/RG-2018-670388?"}'
                    disabled="disabled"
                  >
                    Engrave
                  </Button3>
                </Div25>
                <P6>Select your options to see availability</P6>
                <div>
                  <div>
                    <Div26>
                      <Div27>Pick-up today</Div27>
                      <A16 style={{ display: 'block' }} data-dialog-preset="findInStoreOptions">
                        Find A Store
                      </A16>
                      Pick up in store within 4 hours — no shipping fees
                    </Div26>
                  </div>
                </div>
              </div>
              <Div28>
                <Div29>
                  <Div30>
                    <Label3 for="quantitycatalog_product_RG-2018">Qty:</Label3>
                    <Input6
                      type="number"
                      name="quantity"
                      value="1"
                      required="required"
                      min="1"
                    />
                  </Div30>
                </Div29>
                {/* <Button4 href={seller.addToCartLink} name="button" type="submit" value="add_to_cart">
                  Add to Bag
                </Button4> */}
                <Button5
                  name="button"
                  type="button"
                  value="add_to_wish_list"
                  data-proxy-submit-button="[data-wish-list-form]"
                  data-analytics='{"event":"addToWishList","domEvent":"click"}'
                >
                  <Div31>
                    <Svg6
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      code='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" class="svg-icon svg-icon--large svg-icon--white" style="   fill: rgb(255, 255, 255);   height: 16px;   width: 16px;   display: inline-block;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Mobile Navigation</title><path d="M11.952 1.036C8.939.864 8 3.07 8 3.07S7.061.838 4.048 1.01c-3.013.17-5 3.234-3.58 6.779C1.887 11.333 8 15 8 15s6.113-3.64 7.532-7.186c1.42-3.543-.567-6.607-3.58-6.778"></path></svg>'
                    />
                    <Span11>Wish List</Span11>
                  </Div31>
                </Button5>
              </Div28>
              
              <P8
                name="button"
                href={seller.addToCartLink}
                type="button"
                data-assemblage-selection-button='{"selectAssemblageProduct":true,"productData":{"product_id":"RG-2018","sku":null},"getDynamicSku":true,"isAttachment":true,"form":"#assemblage-add-to-tray-form"}'
                data-assemblage-validation-button=""
              >
                Add to Bag
              </P8>
              <Div32>
                {product.description}
              </Div32>
              {/* <Div33>
                <Div34>Product Specifications:</Div34>
                <Ul3>
                  <li>Sterling silver</li>
                  <li>Available in whole and half sizes 4-10</li>
                  <li>3/16" wide</li> <li>New</li>
                </Ul3>
              </Div33> */}
            </Form>{" "}
            <Div35>
              <Div36>RG-2018</Div36>{" "}
              <Div37 itemscope="">
                <A17
                  data-scroll-to-button=""
                  data-analytics='{"event":"lookAtReviews","domEvent":"click"}'
                  href="https://www.jamesavery.com/products/heart-and-vine-ring?metal=Sterling+Silver&via=Z2lkOi8vamFtZXNhdmVyeS9Xb3JrYXJlYTo6Q2F0YWxvZzo6Q2F0ZWdvcnkvNTk5NTAwOTI2MTcwNzAzYWUyMDAwMDA4#reviews"
                >
                  <P9 itemscope="" title="5.0 out of 5 stars">
                    <Svg7
                      xmlns="http://www.w3.org/2000/svg"
                      data-name="Layer 1"
                      viewBox="0 0 16 15.22"
                      code='<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 16 15.22" class="rating__star" style="
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;"><title>star</title><path d="M8 0l1.89 5.81H16L11.05 9.4l1.89 5.82L8 11.62l-4.94 3.6L4.94 9.4 0 5.81h6.11L8 0z"></path></svg>'
                    />{" "}
                    <Svg8
                      xmlns="http://www.w3.org/2000/svg"
                      data-name="Layer 1"
                      viewBox="0 0 16 15.22"
                      code='<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 16 15.22" class="rating__star" style="
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;"><title>star</title><path d="M8 0l1.89 5.81H16L11.05 9.4l1.89 5.82L8 11.62l-4.94 3.6L4.94 9.4 0 5.81h6.11L8 0z"></path></svg>'
                    />{" "}
                    <Svg9
                      xmlns="http://www.w3.org/2000/svg"
                      data-name="Layer 1"
                      viewBox="0 0 16 15.22"
                      code='<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 16 15.22" class="rating__star" style="
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;"><title>star</title><path d="M8 0l1.89 5.81H16L11.05 9.4l1.89 5.82L8 11.62l-4.94 3.6L4.94 9.4 0 5.81h6.11L8 0z"></path></svg>'
                    />{" "}
                    <Svg10
                      xmlns="http://www.w3.org/2000/svg"
                      data-name="Layer 1"
                      viewBox="0 0 16 15.22"
                      code='<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 16 15.22" class="rating__star" style="
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;"><title>star</title><path d="M8 0l1.89 5.81H16L11.05 9.4l1.89 5.82L8 11.62l-4.94 3.6L4.94 9.4 0 5.81h6.11L8 0z"></path></svg>'
                    />{" "}
                    <Svg11
                      xmlns="http://www.w3.org/2000/svg"
                      data-name="Layer 1"
                      viewBox="0 0 16 15.22"
                      code='<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 16 15.22" class="rating__star" style="
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;"><title>star</title><path d="M8 0l1.89 5.81H16L11.05 9.4l1.89 5.82L8 11.62l-4.94 3.6L4.94 9.4 0 5.81h6.11L8 0z"></path></svg>'
                    />{" "}
                    <Span12 />
                  </P9>
                </A17>{" "}
                <A18
                  data-scroll-to-button=""
                  href="https://www.jamesavery.com/products/heart-and-vine-ring?metal=Sterling+Silver&via=Z2lkOi8vamFtZXNhdmVyeS9Xb3JrYXJlYTo6Q2F0YWxvZzo6Q2F0ZWdvcnkvNTk5NTAwOTI2MTcwNzAzYWUyMDAwMDA4#reviews"
                >
                  <Span13>Read Reviews</Span13>
                </A18>
              </Div37>{" "}
              <Form2
                data-wish-list-form=""
                action="/users/wish_list/add_item"
                accept-charset="UTF-8"
                method="post"
                novalidate="novalidate"
              >
                <input name="utf8" type="hidden" value="✓" />{" "}
                <input
                  type="hidden"
                  name="authenticity_token"
                  value="dKd7jm3GofOJw/N710F3CABRWJSz5LvKcz8rcNdylcSDUehQcsLV2XGoHPOAAglcNr90cdaWQFgxD2ErNAc6XQ=="
                />{" "}
                <input type="hidden" name="product_id" value="RG-2018" />{" "}
                <input type="hidden" name="sku" />{" "}
                <input type="hidden" name="quantity" value="1" />{" "}
                <input
                  type="hidden"
                  name="return_to"
                  value="/users/wish_list"
                />{" "}
                <P10 name="button" type="submit" value="add_to_wish_list">
                  Add to Wish List
                </P10>
              </Form2>
            </Div35>{" "}
            <P11>View Full Details</P11>
          </Div18>
        </Div17>
      </Div>{" "}
    </>
  );
}

const Div = styled.div`
  display: table;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  table-layout: fixed;
  border-bottom: 3px solid rgb(255, 255, 255);
  border-bottom-color: rgb(255, 255, 255);
  border-bottom-style: solid;
  border-bottom-width: 3px;
  width: 100%;
  background-color: rgb(244, 246, 250);
  @media (max-width: 991px) {
    display: block;
    table-layout: auto;
    border-bottom: 0px none rgb(0, 0, 0);
    border-bottom-color: rgb(0, 0, 0);
    border-bottom-style: none;
    border-bottom-width: 0px;
    width: auto;
  }
`;

const Div2 = styled.div`
  display: table-cell;
  vertical-align: top;
  width: 50%;
  background-color: rgb(244, 246, 250);
  @media (max-width: 991px) {
    display: block;
    vertical-align: baseline;
    width: auto;
  }
`;

const Div3 = styled.div`
  padding-top: 72px;
  padding-bottom: 14px;
  padding-left: 14px;
  padding-right: 14px;
  margin-left: auto;
  margin-right: auto;
  max-width: 528px;
  text-align: center;
  @media (max-width: 991px) {
    padding-bottom: 13px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 8px;
  }
`;

const Div4 = styled.div`
  max-width: 100%;
  background-color: rgb(255, 255, 255);
  display: block;
  position: relative;
  touch-action: pan-y;
  user-select: none;
`;

const Button = styled.button`
  left: 16px;
  position: absolute;
  top: calc(50% + 0px);
  transform: translate(0px, -50%);
  z-index: 10;
  height: 16px;
  width: 16px;
  border-bottom: 0px;
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  cursor: pointer;
  display: block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0);
  border-color: rgba(0, 0, 0, 0);
  background-image: url("https://jamesavery-productionv3-weblinc.netdna-ssl.com/assets/workarea/storefront/icons/with_colors/arrow_left_grayish_blue-3bab62861587b825e959254e50aa58c0d672c23906f424a40da45a8313ce2750.svg");
  background-size: 16px 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  text-indent: 200%;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 991px) {
    left: 8px;
    border-color: rgb(0, 0, 0);
  }
`;

const Div5 = styled.div`
  text-align: center;
  transform: translate3d(0px, 0px, 0px);
  display: block;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
`;

const Div6 = styled.div`
  margin: auto;
  display: inline-block;
  left: 0px;
  position: relative;
  top: 0px;
  
`;

const A = styled.a`
  display: block;
  height: 100%;
  width: 372px;
  position: relative;
  float: left;
  min-height: 1px;
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  background-color: transparent;
  
`;

const Span = styled.span`
  display: block;
  width: 100%;
`;

const RawImg1 = styled.img`
  height: 100%;
  width: 100%;
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const RawImg2 = styled.img`
  width: 100%;
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const RawImg6 = styled.img`
  width: 100%;
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Div7 = styled.div`
  bottom: 11px;
  left: 17px;
  pointer-events: none;
  position: absolute;
  @media (max-width: 991px) {
    bottom: 6px;
    left: 6px;
  }
`;

const Svg = styled('custom-code')`
  fill: rgb(183, 191, 204);
  height: 24px;
  width: 24px;
  display: inline-block;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  @media (max-width: 991px) {
    height: 16px;
    width: 16px;
  }
`;

const Div8 = styled.div`
  display: block;
  bottom: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: absolute;
  right: 8px;
  transition: width 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: width;
  white-space: nowrap;
  width: 44px;
  @media (max-width: 991px) {
    display: none;
  }
`;

const P = styled.p`
  color: rgb(103, 112, 127);
  display: inline-block;
  font-weight: 600;
  letter-spacing: 1px;
  vertical-align: middle;
`;

const Div9 = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const Ul = styled.ul`
  list-style: none;
  padding-inline-start: 0px;
  list-style-type: none;
`;

const Li = styled.li`
  margin-left: 2px;
  margin-right: 2px;
  vertical-align: middle;
  display: inline-block;
`;

const A7 = styled.a`
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const Svg2 = styled('custom-code')`
  display: inline-block;
  fill: rgb(103, 112, 127);
  height: 16px;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  width: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const A8 = styled.a`
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const Svg3 = styled('custom-code')`
  display: inline-block;
  fill: rgb(103, 112, 127);
  height: 16px;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  width: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const A9 = styled.a`
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const Svg4 = styled('custom-code')`
  display: inline-block;
  fill: rgb(103, 112, 127);
  height: 16px;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  width: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const A10 = styled.a`
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const Svg5 = styled('custom-code')`
  display: inline-block;
  fill: rgb(103, 112, 127);
  height: 20px;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  width: 20px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const Button2 = styled.button`
  right: 16px;
  position: absolute;
  top: calc(50% + 0px);
  transform: translate(0px, -50%);
  z-index: 10;
  height: 16px;
  width: 16px;
  border-bottom: 0px;
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  cursor: pointer;
  display: block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0);
  border-color: rgba(0, 0, 0, 0);
  background-image: url("https://jamesavery-productionv3-weblinc.netdna-ssl.com/assets/workarea/storefront/icons/with_colors/arrow_right_grayish_blue-fb03edaf7b03b6d21c22737751b6c605bd19b3bccc3c7604938d29f659216ef3.svg");
  background-size: 16px 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  text-indent: 200%;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 991px) {
    right: 8px;
    border-color: rgb(0, 0, 0);
  }
`;

const Div10 = styled.div`
  display: inline-block;
  margin-bottom: 16px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 16px;
  max-width: 528px;
  overflow: auto;
  overflow-x: auto;
  overflow-y: auto;
  white-space: nowrap;
  position: relative;
  touch-action: pan-y;
  user-select: none;
  list-style: none;
  list-style-type: none;
  @media (max-width: 991px) {
    display: none;
  }
`;

const Div11 = styled.div`
  transform: translate3d(0px, 0px, 0px);
  display: block;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
`;

const Div12 = styled.div`
  transform: translate3d(0px, 0px, 0px);
  display: block;
  left: 0px;
  position: relative;
  top: 0px;
  width: 288px;
  
`;

const Div13 = styled.div`
  display: block;
  width: 64px;
  float: left;
  margin-left: 4px;
  margin-right: 4px;
  height: 100%;
  min-height: 1px;
  
`;

const A11 = styled.a`
  border-bottom-color: rgb(240, 90, 80);
  border-color: rgb(240, 90, 80);
  border-left-color: rgb(240, 90, 80);
  border-right-color: rgb(240, 90, 80);
  border-top-color: rgb(240, 90, 80);
  cursor: default;
  border-bottom: 1px solid transparent;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-left: 1px solid transparent;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid transparent;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid transparent;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  display: block;
  color: rgb(240, 90, 80);
  text-decoration: none;
  background-color: transparent;
`;

const Span7 = styled.span`
  font-size: 10px;
`;

const RawImg7 = styled.img`
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Div14 = styled.div`
  display: block;
  width: 64px;
  float: left;
  margin-left: 4px;
  margin-right: 4px;
  height: 100%;
  min-height: 1px;
  
`;

const A12 = styled.a`
  border-bottom: 1px solid transparent;
  border-bottom-color: transparent;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgba(0, 0, 0, 0);
  border-left: 1px solid transparent;
  border-left-color: transparent;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid transparent;
  border-right-color: transparent;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid transparent;
  border-top-color: transparent;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  display: block;
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  background-color: transparent;
`;

const Span8 = styled.span`
  font-size: 10px;
`;

const RawImg8 = styled.img`
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Div15 = styled.div`
  display: block;
  width: 64px;
  float: left;
  margin-left: 4px;
  margin-right: 4px;
  height: 100%;
  min-height: 1px;
  
`;

const A13 = styled.a`
  border-bottom: 1px solid transparent;
  border-bottom-color: transparent;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgba(0, 0, 0, 0);
  border-left: 1px solid transparent;
  border-left-color: transparent;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid transparent;
  border-right-color: transparent;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid transparent;
  border-top-color: transparent;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  display: block;
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  background-color: transparent;
`;

const Span9 = styled.span`
  font-size: 10px;
`;

const RawImg9 = styled.img`
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Div16 = styled.div`
  display: block;
  width: 64px;
  float: left;
  margin-left: 4px;
  margin-right: 4px;
  height: 100%;
  min-height: 1px;
  
`;

const A14 = styled.a`
  border-bottom: 1px solid transparent;
  border-bottom-color: transparent;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgba(0, 0, 0, 0);
  border-left: 1px solid transparent;
  border-left-color: transparent;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid transparent;
  border-right-color: transparent;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid transparent;
  border-top-color: transparent;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  display: block;
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  background-color: transparent;
`;

const Span10 = styled.span`
  font-size: 10px;
`;

const RawImg10 = styled.img`
  display: block;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Div17 = styled.div`
  display: table-cell;
  vertical-align: top;
  width: 50%;
  background-color: rgb(255, 255, 255);
  @media (max-width: 991px) {
    display: block;
    vertical-align: baseline;
    width: auto;
  }
`;

const Div18 = styled.div`
  margin-right: 56px;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 100px;
  @media (max-width: 991px) {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 0px;
    margin-right: 0px;
  }
`;

const Div19 = styled.div`
  border-bottom: 2px solid rgb(234, 238, 245);
  border-bottom-color: rgb(234, 238, 245);
  border-bottom-style: solid;
  border-bottom-width: 2px;
  clear: both;
  padding-bottom: 16px;
  font-size: 22px;
  letter-spacing: 2px;
  display: block;
  color: rgb(48, 53, 65);
  font-family: Lora;
  @media (max-width: 991px) {
    padding-top: 16px;
    font-size: 15px;
    letter-spacing: 1px;
  }
`;

const Div20 = styled.div`
  border-bottom: 2px solid rgb(234, 238, 245);
  border-bottom-color: rgb(234, 238, 245);
  border-bottom-style: solid;
  border-bottom-width: 2px;
  clear: both;
  padding-bottom: 16px;
  padding-top: 16px;
`;

const Div21 = styled.div`
  display: inline-block;
  vertical-align: middle;
  @media (max-width: 991px) {
    display: block;
    vertical-align: baseline;
  }
`;

const P2 = styled.p`
  letter-spacing: 1.5px;
  font-size: 16px;
  color: rgb(103, 112, 127);
  display: inline-block;
  font-family: Lora;
  @media (max-width: 991px) {
    letter-spacing: 1px;
  }
`;

const P3 = styled.p`
  float: right;
  line-height: 25px;
  color: rgb(103, 112, 127);
  font-size: 12px;
  letter-spacing: 0.43px;
  @media (max-width: 991px) {
    float: none;
    line-height: 18px;
  }
`;

const Form = styled.form`
  margin-top: 24px;
`;

const Input = styled.input`
  font-size: 16px;
`;

const Div22 = styled.div`
  margin-bottom: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 4px;
`;

const Li5 = styled.li`
  display: inline-block;
  height: 32px;
  margin-bottom: 8px;
  position: relative;
  width: 32px;
`;

const A15 = styled.a`
  height: 100%;
  width: 100%;
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const RawImg11 = styled.img`
  border-bottom-color: rgb(240, 90, 80);
  border-color: rgb(240, 90, 80);
  border-left-color: rgb(240, 90, 80);
  border-right-color: rgb(240, 90, 80);
  border-top-color: rgb(240, 90, 80);
  border-bottom: 1px solid transparent;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-left: 1px solid transparent;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid transparent;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid transparent;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  bottom: 0px;
  display: block;
  inset: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
  font-style: italic;
  max-width: 100%;
  vertical-align: middle;
`;

const Input5 = styled.input`
  left: -99999px;
  position: absolute;
  top: 0px;
  font-size: 16px;
`;

const Div23 = styled.div`
  margin-bottom: 8px;
`;

const Div24 = styled.div`
  border-bottom: 1px solid rgb(234, 238, 245);
  border-bottom-color: rgb(234, 238, 245);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(234, 238, 245);
  border-left: 1px solid rgb(234, 238, 245);
  border-left-color: rgb(234, 238, 245);
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid rgb(234, 238, 245);
  border-right-color: rgb(234, 238, 245);
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid rgb(234, 238, 245);
  border-top-color: rgb(234, 238, 245);
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  margin-bottom: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  display: inline-block;
  position: relative;
`;

const Select = styled.select`
  border-bottom: 0px;
  border-color: rgb(103, 112, 127);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  color: rgb(103, 112, 127);
  font-size: 16px;
  padding-left: 16px;
  width: calc(100% + 60px);
  background-color: rgb(255, 255, 255);
  height: 40px;
  letter-spacing: 1.3px;
  padding-right: 32px;
  min-height: 40px;
`;

const Div25 = styled.div`
  border-left: 2px solid rgb(234, 238, 245);
  border-left-color: rgb(234, 238, 245);
  border-left-style: solid;
  border-left-width: 2px;
  border-top: 0px;
  margin-bottom: 16px;
  margin-left: 16px;
  padding-bottom: 24px;
  padding-left: 24px;
  display: none;
  float: right;
  font-size: 12px;
  @media (max-width: 991px) {
    border-top: 2px solid rgb(234, 238, 245);
    border-top-color: rgb(234, 238, 245);
    border-top-style: solid;
    border-top-width: 2px;
    padding-bottom: 16px;
    padding-left: 0px;
    padding-top: 16px;
    border-left: 0px none rgb(0, 0, 0);
    border-left-color: rgb(0, 0, 0);
    border-left-style: none;
    border-left-width: 0px;
    margin-bottom: 0px;
    margin-left: 0px;
  }
`;

const P4 = styled.p`
  margin-bottom: 8px;
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.86px;
`;

const P5 = styled.p`
  margin-bottom: 16px;
  color: rgb(103, 112, 127);
  font-size: 12px;
  letter-spacing: 1px;
`;

const Button3 = styled.button`
  background-color: rgb(255, 255, 255);
  border-bottom: 1px solid;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(183, 191, 204);
  border-left: 1px solid;
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid;
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid;
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  color: rgb(183, 191, 204);
  margin-bottom: 8px;
  margin-right: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 8px;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease 0s, background 0.2s ease 0s;
  transition-delay: 0s, 0s;
  transition-duration: 0.2s, 0.2s;
  transition-property: color, background;
  transition-timing-function: ease, ease;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
`;

const P6 = styled.p`
  margin-bottom: 16px;
`;

const Div26 = styled.div`
  border-top: 2px solid rgb(234, 238, 245);
  border-top-color: rgb(234, 238, 245);
  border-top-style: solid;
  border-top-width: 2px;
  border-bottom: 2px solid rgb(234, 238, 245);
  border-bottom-color: rgb(234, 238, 245);
  border-bottom-style: solid;
  border-bottom-width: 2px;
  clear: both;
  padding-bottom: 16px;
  padding-top: 16px;
`;

const Div27 = styled.div`
  font-weight: 600;
  letter-spacing: 0.86px;
  margin-right: 4px;
`;

const A16 = styled.a`
  display: block;
  padding: 15px 0;
  color: rgb(240, 90, 80);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 0px;
  border-color: rgb(240, 90, 80);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
`;

const Div28 = styled.div`
  margin-top: 30px;
  clear: both;
  @media (max-width: 991px) {
    margin-left: -16px;
    margin-right: -16px;
  }
`;

const Div29 = styled.div`
  width: 88px;
  background: white;
  border-bottom: 1px solid rgb(234, 238, 245);
  border-bottom-color: rgb(234, 238, 245);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-color: rgb(234, 238, 245);
  border-left: 1px solid rgb(234, 238, 245);
  border-left-color: rgb(234, 238, 245);
  border-left-style: solid;
  border-left-width: 1px;
  border-right: 1px solid rgb(234, 238, 245);
  border-right-color: rgb(234, 238, 245);
  border-right-style: solid;
  border-right-width: 1px;
  border-style: solid;
  border-top: 1px solid rgb(234, 238, 245);
  border-top-color: rgb(234, 238, 245);
  border-top-style: solid;
  border-top-width: 1px;
  border-width: 1px;
  cursor: pointer;
  float: left;
  height: 56px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
  display: inline-block;
  font-weight: normal;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  @media (max-width: 991px) {
    width: 77px;
  }
`;

const Div30 = styled.div`
  left: calc(50% + 0px);
  position: absolute;
  top: calc(50% + 0px);
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

const Label3 = styled.label`
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  vertical-align: middle;
`;

const Input6 = styled.input`
  border-bottom: 0px;
  border-color: rgb(103, 112, 127);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  color: rgb(103, 112, 127);
  display: inline-block;
  font-size: 12px;
  vertical-align: middle;
  width: 24px;
`;

const Button4 = styled.button`
  width: calc(100% - 252px);
  background-color: rgb(240, 90, 80);
  color: rgb(255, 255, 255);
  font-weight: 600;
  letter-spacing: 2px;
  text-decoration: none;
  cursor: pointer;
  float: left;
  height: 56px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: absolute;
  border-bottom: 0px;
  border-color: rgb(255, 255, 255);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  left: calc(50% + 0px);
  top: calc(50% + 0px);
  transform: translate(-50%, -50%);
  @media (max-width: 991px) {
    width: calc(100% - 133px);
  }
`;

const Button5 = styled.button`
  display: block;
  width: 164px;
  background-color: rgb(183, 191, 204);
  float: right;
  font-weight: 600;
  letter-spacing: 2px;
  text-decoration: none;
  cursor: pointer;
  height: 56px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
  border-bottom: 0px;
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  border-color: rgba(0, 0, 0, 0);
  @media (max-width: 991px) {
    width: 56px;
    border-color: rgb(0, 0, 0);
  }
`;

const Div31 = styled.div`
  left: calc(50% + 0px);
  position: absolute;
  top: calc(50% + 0px);
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

const Svg6 = styled('custom-code')`
  fill: rgb(255, 255, 255);
  height: 16px;
  width: 16px;
  display: inline-block;
  transition: fill 0.2s ease 0s;
  transition-duration: 0.2s;
  transition-property: fill;
  vertical-align: middle;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const Span11 = styled.span`
  display: inline-block;
  color: rgb(255, 255, 255);
  margin-left: 8px;
  @media (max-width: 991px) {
    display: none;
  }
`;

const P7 = styled.p`
  margin-bottom: 16px;
  display: block;
  text-align: center;
  width: 100%;
  background-color: rgb(240, 90, 80);
  color: rgb(255, 255, 255);
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 2px;
  min-height: 48px;
  padding-bottom: 16px;
  padding-top: 16px;
  text-decoration: none;
  transition: color 0.2s ease 0s, background 0.2s ease 0s;
  transition-delay: 0s, 0s;
  transition-duration: 0.2s, 0.2s;
  transition-property: color, background;
  transition-timing-function: ease, ease;
  border-bottom: 0px;
  border-color: rgb(255, 255, 255);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
`;

const P8 = styled.p`
  margin-bottom: 16px;
  display: block;
  text-align: center;
  width: 100%;
  background-color: rgb(240, 90, 80);
  color: rgb(255, 255, 255);
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 2px;
  min-height: 24px;
  padding-bottom: 16px;
  padding-top: 16px;
  text-decoration: none;
  transition: color 0.2s ease 0s, background 0.2s ease 0s;
  transition-delay: 0s, 0s;
  transition-duration: 0.2s, 0.2s;
  transition-property: color, background;
  transition-timing-function: ease, ease;
  border-bottom: 0px;
  border-color: rgb(255, 255, 255);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
`;

const Div32 = styled.div`
  letter-spacing: 0.5px;
  padding-top: 24px;
  margin-bottom: 16px;
`;

const Div33 = styled.div`
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const Div34 = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const Ul3 = styled.ul`
  list-style-type: none;
`;

const Div35 = styled.div`
  display: inline-block;
  width: 100%;
`;

const Div36 = styled.div`
  color: rgb(103, 112, 127);
  float: left;
  font-size: 12px;
`;

const Div37 = styled.div`
  float: right;
  font-size: 12px;
  margin-bottom: 12px;
`;

const A17 = styled.a`
  color: rgb(240, 90, 80);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  background-color: transparent;
`;

const P9 = styled.p`
  display: inline-block;
  margin-right: 5px;
  position: relative;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
`;

const Svg7 = styled('custom-code')`
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;
`;

const Svg8 = styled('custom-code')`
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;
`;

const Svg9 = styled('custom-code')`
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;
`;

const Svg10 = styled('custom-code')`
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;
`;

const Svg11 = styled('custom-code')`
  display: inline-block;
  fill: rgb(240, 90, 80);
  height: 16px;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 16px;
`;

const Span12 = styled.span`
  left: -99999px;
  position: absolute;
  top: 0px;
`;

const A18 = styled.a`
  display: block;
  text-align: center;
  line-height: 25px;
  vertical-align: top;
  color: rgb(240, 90, 80);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 0px;
  border-color: rgb(240, 90, 80);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  white-space: nowrap;
`;

const Span13 = styled.span`
  color: rgb(103, 112, 127);
  font-weight: 600;
  margin-right: 8px;
  display: inline-block;
`;

const Form2 = styled.form`
  display: none;
`;

const P10 = styled.p`
  margin-bottom: 16px;
  color: rgb(240, 90, 80);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-decoration: none;
  border-bottom: 0px;
  border-color: rgb(240, 90, 80);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  cursor: pointer;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0);
`;

const P11 = styled.p`
  margin-bottom: 16px;
  display: inline-block;
  color: rgb(240, 90, 80);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 0px;
  border-color: rgb(240, 90, 80);
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  line-height: 1;
  vertical-align: middle;
  white-space: nowrap;
`;

