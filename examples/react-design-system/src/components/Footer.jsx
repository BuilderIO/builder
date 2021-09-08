// import styled from "styled-components";
import React from 'react';
import { BuilderComponent } from '@builder.io/react'

export function Footer() {
  return <BuilderComponent model="footer" />
}

// export function Footer(props) {
//   return (
//     <Div role="contentinfo">
//       {/* <Div2>
//         <Div3>
//           <h41>Never miss an email</h41>
//           <Form
//             data-analytics='{"event":"emailSignup","domEvent":"submit"}'
//             action="/email_signup"
//             accept-charset="UTF-8"
//             method="post"
//             novalidate="novalidate"
//           >
//             <Input name="utf8" type="hidden" value="✓" />
//             <input
//               type="hidden"
//               name="authenticity_token"
//               value="TiQ3xGd9W7kt5slIYSpYzPEt0Qroy4XrKu+VsYdZO6dVbFXbMALjaGGRbzCOX6TMcX8TvxEL6M8v/K/DG+txXA=="
//             />
//             <Div4>
//               <Input3
//                 type="email"
//                 name="email"
//                 placeholder="Email Address"
//                 title="Email"
//                 required="required"
//               />
//             </Div4>
//             <Div5 name="button" type="submit" value="sign_up">
//               Sign Up
//             </Div5>
//           </Form>
//         </Div3>
//         <Div6>
//           <h4>Connect With Us</h4>
//           <Ul>
//             <Li>
//               <A target="_blank" href="https://www.facebook.com/JamesAvery/">
//                 <Svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   code='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Follow On Facebook</title><path d="M6.488 16h3.128V8.006h2.11L12 5.181H9.616v-1.66c0-.625.39-.77.663-.77h1.682V.01L9.644 0C7.072 0 6.488 2.045 6.488 3.354V5.18H5v2.825h1.488V16z"></path></svg>'
//                 />
//               </A>
//             </Li>
//             <li>
//               <a target="_blank" href="https://twitter.com/jamesavery/">
//                 <span
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   code='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Follow On Twitter</title><path d="M14.115 4.056a3.288 3.288 0 0 0 1.443-1.816 6.572 6.572 0 0 1-2.084.797A3.28 3.28 0 0 0 11.078 2 3.282 3.282 0 0 0 7.88 6.03 9.319 9.319 0 0 1 1.114 2.6 3.276 3.276 0 0 0 .67 4.25a3.28 3.28 0 0 0 1.46 2.732 3.276 3.276 0 0 1-1.487-.41v.041a3.285 3.285 0 0 0 2.633 3.218 3.285 3.285 0 0 1-1.482.057 3.287 3.287 0 0 0 3.065 2.28A6.586 6.586 0 0 1 0 13.526 9.302 9.302 0 0 0 5.033 15c6.037 0 9.339-5 9.339-9.338 0-.142-.004-.283-.01-.425A6.674 6.674 0 0 0 16 3.54a6.574 6.574 0 0 1-1.885.517z"></path></svg>'
//                 />
//               </a>
//             </li>
//             <li>
//               <a target="_blank" href="https://www.instagram.com/JamesAvery/">
//                 <Svg3
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 32 32"
//                   code='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 20px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 20px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Follow On Instagram</title><path d="M5.6 1.9h20.9c2 0 3.6 1.6 3.6 3.6v20.9c0 2-1.6 3.6-3.6 3.6H5.6c-2 0-3.6-1.6-3.6-3.6V5.6c-.1-2 1.6-3.7 3.6-3.7zm16.8 3.2c-.7 0-1.3.6-1.3 1.3v3c0 .7.6 1.3 1.3 1.3h3.2c.7 0 1.3-.6 1.3-1.3v-3c0-.7-.6-1.3-1.3-1.3h-3.2zm4.5 8.7h-2.5c.2.8.4 1.6.4 2.4 0 4.7-3.9 8.5-8.7 8.5-4.8 0-8.7-3.8-8.7-8.5 0-.8.1-1.6.4-2.4H5.1v11.9c0 .6.5 1.1 1.1 1.1h19.6c.6 0 1.1-.5 1.1-1.1V13.8zM16 10.5c-3.1 0-5.6 2.4-5.6 5.5 0 3 2.5 5.5 5.6 5.5 3.1 0 5.6-2.5 5.6-5.5.1-3.1-2.5-5.5-5.6-5.5z"></path></svg>'
//                 />
//               </a>
//             </li>
//             <li>
//               <a target="_blank" href="https://www.pinterest.com/JamesAvery/">
//                 <span
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   code='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Follow On Pinterest</title><path d="M3.882 9.252c.21.086.399.003.46-.23.042-.161.143-.568.188-.737.061-.231.037-.312-.133-.512-.37-.437-.606-1.003-.606-1.803 0-2.322 1.738-4.402 4.525-4.402 2.467 0 3.824 1.508 3.824 3.522 0 2.65-1.173 4.887-2.914 4.887-.962 0-1.681-.795-1.45-1.77.276-1.165.81-2.422.81-3.262 0-.752-.403-1.38-1.239-1.38-.983 0-1.772 1.018-1.772 2.38 0 .867.293 1.454.293 1.454l-1.182 5.008c-.351 1.486-.053 3.308-.027 3.492.014.11.154.135.218.052.09-.118 1.261-1.563 1.659-3.007.112-.408.646-2.526.646-2.526.32.61 1.253 1.145 2.245 1.145 2.955 0 4.96-2.693 4.96-6.298 0-2.726-2.31-5.265-5.82-5.265C4.203 0 2 3.13 2 5.741c0 1.581.598 2.987 1.882 3.511z"></path></svg>'
//                 />
//               </a>
//             </li>
//             <li>
//               <a
//                 target="_blank"
//                 href="https://www.youtube.com/user/JamesAveryJewelry/"
//               >
//                 <span
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   code='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="svg-icon" style="   display: inline-block;   fill: rgb(103, 112, 127);   height: 16px;   transition: fill 0.2s ease 0s;   transition-duration: 0.2s;   transition-property: fill;   vertical-align: middle;   width: 16px;   overflow: hidden;   overflow-x: hidden;   overflow-y: hidden;"><title>Follow On Youtube</title><path d="M13.205 13.893H2.795C1.253 13.893 0 12.662 0 11.146V5.747C0 4.231 1.253 3 2.795 3h10.41C14.747 3 16 4.231 16 5.747v5.4c0 1.515-1.253 2.746-2.795 2.746zm-2.603-5.399L8.386 7.263 6.169 6.126v4.641l2.217-1.136 2.216-1.137z"></path></svg>'
//                 />
//               </a>
//             </li>
//           </Ul>
//         </Div6>
//       </Div2> */}
//       <Div7>
//         <Div8>
//           <div
//             data-analytics='{"event":"contentBlockDisplay","payload":{"id":"5d0800427f5576010cdb087a","type":"four_column_taxonomy","position":0,"data":{"header_1":"Our Company","start_1":"5d07ff897f5576010cdb084d","header_2":"Customer Care","start_2":"5d0805745f034e010fb19c26","header_3":"Buying Guides","start_3":"5d08f4d35f034e010fb1a352","header_4":"More Ways To Shop","start_4":"5d08f4e25f034e010fb1a358","image":"","image_alt":"Image Alt","image_link":"/","image_position":"Left","container_styles":{"padding_top":"","padding_right":"","padding_bottom":"","padding_left":"","margin_top":"","margin_bottom":"","background_color":"#ffffff"},"responsive_container_styles":{"padding_top":"","padding_right":"","padding_bottom":"","padding_left":"","margin_top":"","margin_bottom":""}}}}'
//             data-hidden-block-css-content="Block hidden at this breakpoint"
//           >
//             <Div9>
//               <Div10 data-accordion='{"mobileOnly":true}'>
//                 <Span>Our Company</Span>
//                 <Ul2>
//                   <Li6>About Us</Li6>
//                   <Li7>Charitable Giving</Li7>
//                   <Li8>Newsroom</Li8>
//                   <Li9>Careers</Li9>
//                   <Li10>Contest Rules</Li10>
//                 </Ul2>
//               </Div10>
//               <Div11 data-accordion='{"mobileOnly":true}'>
//                 <span>Customer Care</span>
//                 <Ul3>
//                   <Li11>Customer Service</Li11>
//                   <Li12>Order Status</Li12>
//                   <Li13>Shipping Information</Li13>
//                   <Li14>Returns & Exchanges</Li14>
//                   <Li15 data-dialog-button="">Gift Card Balance</Li15>
//                   <Li16>Jewelry Care & Safety Tips</Li16>
//                   <Li17>Coupons & Promo Codes</Li17>
//                   <Li18 data-dialog-button="">Contact Us</Li18>
//                 </Ul3>
//               </Div11>
//               <Div12 data-accordion='{"mobileOnly":true}'>
//                 <span>Buying Guides</span>
//                 <Ul4>
//                   <Li19>Birthstone Guide</Li19>
//                   <Li20>Jewelry Information</Li20>
//                   <Li21>Bracelet Sizer</Li21>
//                   <Li22>Ring Sizer</Li22>
//                   <Li23>Engraving Guide</Li23>
//                   <Li24>Create Your Own</Li24>
//                   <Li25>Site Map</Li25>
//                 </Ul4>
//               </Div12>
//               <Div13 data-accordion='{"mobileOnly":true}'>
//                 <span>More Ways To Shop</span>
//                 <Ul5>
//                   <Li26>Find A Store</Li26>
//                   <Li27>Shop By Catalog</Li27>
//                   <Li28>Request A Catalog</Li28>
//                   <Li29 data-dialog-button="">Find A Wish List</Li29>
//                   <Li30>Buy Online Pick-up In Store</Li30>
//                 </Ul5>
//               </Div13>
//             </Div9>
//           </div>
//         </Div8>
//       </Div7>
//       <Ul6>
//         <Li31>Privacy Notice</Li31>
//         <Li32>Terms & Conditions</Li32>
//         <Li33>Accessibility</Li33>
//       </Ul6>
//       <P>© 2021 James Avery Craftsman Inc</P>
//     </Div>
//   );
// }

// const Div = styled.div`
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   flex-shrink: 0;
//   box-sizing: border-box;
//   background-color: rgb(244, 246, 250);
//   clear: both;
//   text-align: center;
//   @media (max-width: 991px) {
//     margin-bottom: 48px;
//   }
// `;

// const Div2 = styled.div`
//   display: block;
//   margin-left: auto;
//   margin-right: auto;
//   padding-left: 16px;
//   padding-right: 16px;
//   position: relative;
//   height: 144px;
//   font-size: 0rem;
//   list-style: none;
//   list-style-type: none;
//   @media (max-width: 991px) {
//     margin-left: -8px;
//     margin-right: 0px;
//     padding-left: 0px;
//     padding-right: 0px;
//     position: static;
//   }
// `;

// const Div3 = styled.div`
//   float: left;
//   width: 50%;
//   height: 100%;
//   padding-bottom: 16px;
//   padding-top: 32px;
//   display: inline-block;
//   font-size: 1rem;
//   vertical-align: top;
//   @media (max-width: 991px) {
//     width: 100%;
//   }
// `;

// const h41 = styled.h4`
//   margin-bottom: 16px;
//   font-weight: normal;
//   font-size: 18px;
//   display: block;
//   color: rgb(48, 53, 65);
//   font-family: Lora;
//   letter-spacing: 1px;
//   @media (max-width: 991px) {
//     font-size: 16px;
//   }
// `;

// const Form = styled.form`
//   max-width: 382px;
//   margin-left: auto;
//   margin-right: auto;
//   @media (max-width: 991px) {
//     max-width: 91.4894%;
//   }
// `;

// const Input = styled.input`
//   font-size: 16px;
// `;

// const Div4 = styled.div`
//   width: calc(100% - 129px);
//   display: inline-block;
//   vertical-align: top;
//   @media (max-width: 991px) {
//     width: calc(100% - 110px);
//   }
// `;

// const Input3 = styled.input`
//   border-bottom: 0px;
//   border-color: rgb(48, 53, 65);
//   border-left: 0px;
//   border-right: 0px;
//   border-top: 0px;
//   padding-left: 8px;
//   padding-right: 8px;
//   width: 100%;
//   min-height: 40px;
//   color: rgb(48, 53, 65);
//   letter-spacing: 1.3px;
//   line-height: 40px;
//   @media (max-width: 991px) {
//     font-size: 16px;
//   }
// `;

// const Div5 = styled.div`
//   width: 100%;
//   display: block;
//   vertical-align: middle;
//   padding-left: 16px;
//   padding-right: 16px;
//   text-align: center;
//   min-height: 40px;
//   padding-bottom: 12px;
//   padding-top: 12px;
//   background-color: rgb(103, 112, 127);
//   color: rgb(255, 255, 255);
//   cursor: pointer;
//   font-weight: 600;
//   letter-spacing: 2px;
//   text-decoration: none;
//   transition: color 0.2s ease 0s, background 0.2s ease 0s;
//   transition-delay: 0s, 0s;
//   transition-duration: 0.2s, 0.2s;
//   transition-property: color, background;
//   transition-timing-function: ease, ease;
//   border-bottom: 0px;
//   border-color: rgb(255, 255, 255);
//   border-left: 0px;
//   border-right: 0px;
//   border-top: 0px;
//   line-height: 1;
//   white-space: nowrap;
//   @media (max-width: 991px) {
//     width: 110px;
//   }
// `;

// const Div6 = styled.div`
//   float: left;
//   width: 50%;
//   height: 100%;
//   padding-bottom: 16px;
//   padding-top: 32px;
//   display: inline-block;
//   font-size: 1rem;
//   vertical-align: top;
//   @media (max-width: 991px) {
//     width: 100%;
//   }
// `;

// const Ul = styled.ul`
//   padding-inline-start: 0;
//   margin-bottom: 16px;
//   list-style: none;
//   list-style-type: none;
// `;

// const Li = styled.li`
//   margin-left: 16px;
//   margin-right: 16px;
//   vertical-align: middle;
//   display: inline-block;
// `;

// const A = styled.a`
//   color: rgb(240, 90, 80);
//   cursor: pointer;
//   text-decoration: none;
//   display: inline-block;
//   background-color: transparent;
// `;

// const Svg = styled.span`
//   display: inline-block;
//   fill: rgb(103, 112, 127);
//   height: 16px;
//   transition: fill 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: fill;
//   vertical-align: middle;
//   width: 16px;
//   overflow: hidden;
//   overflow-x: hidden;
//   overflow-y: hidden;
// `;

// const Svg3 = styled.span`
//   display: inline-block;
//   fill: rgb(103, 112, 127);
//   height: 20px;
//   transition: fill 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: fill;
//   vertical-align: middle;
//   width: 20px;
//   overflow: hidden;
//   overflow-x: hidden;
//   overflow-y: hidden;
// `;

// const Div7 = styled.div`
//   background-color: rgb(255, 255, 255);
//   border-bottom: 2px solid rgb(244, 246, 250);
//   border-bottom-color: rgb(244, 246, 250);
//   border-bottom-style: solid;
//   border-bottom-width: 2px;
//   clear: both;
//   @media (max-width: 991px) {
//     margin-bottom: 16px;
//     margin-top: 16px;
//     border-bottom: 0px none rgb(0, 0, 0);
//     border-bottom-color: rgb(0, 0, 0);
//     border-bottom-style: none;
//     border-bottom-width: 0px;
//   }
// `;

// const Div8 = styled.div`
//   font-family: Avenir;
//   max-width: 1240px;
//   padding-bottom: 32px;
//   padding-left: 24px;
//   padding-right: 24px;
//   padding-top: 32px;
//   color: rgb(48, 53, 65);
//   margin-left: auto;
//   margin-right: auto;
//   @media (max-width: 991px) {
//     max-width: none;
//     padding-bottom: 0px;
//     padding-left: 0px;
//     padding-right: 0px;
//     padding-top: 0px;
//   }
// `;

// const Div9 = styled.div`
//   display: flex;
//   justify-content: space-around;
//   @media (max-width: 991px) {
//     padding-bottom: 16px;
//     padding-left: 16px;
//     padding-right: 16px;
//     padding-top: 16px;
//     display: block;
//     justify-content: normal;
//   }
// `;

// const Div10 = styled.div`
//   border-top: 0px;
//   text-align: left;
//   @media (max-width: 991px) {
//     border-top: 1px solid rgb(234, 238, 245);
//     border-top-color: rgb(234, 238, 245);
//     border-top-style: solid;
//     border-top-width: 1px;
//     text-align: center;
//   }
// `;

// const Span = styled.span`
//   text-align: left;
//   font-family: Lora;
//   font-size: 13px;
//   font-weight: bold;
//   letter-spacing: 1px;
//   margin-bottom: 8px;
//   @media (max-width: 991px) {
//     text-align: center;
//   }
// `;

// const Ul2 = styled.ul`
//   padding-inline-start: 0;
//   text-align: left;
//   list-style: none;
//   list-style-type: none;
//   @media (max-width: 991px) {
//     text-align: center;
//   }
// `;

// const Li6 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li7 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li8 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li9 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li10 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Div11 = styled.div`
//   border-top: 0px;
//   text-align: left;
//   @media (max-width: 991px) {
//     border-top: 1px solid rgb(234, 238, 245);
//     border-top-color: rgb(234, 238, 245);
//     border-top-style: solid;
//     border-top-width: 1px;
//     text-align: center;
//   }
// `;

// const Ul3 = styled.ul`
//   padding-inline-start: 0;
//   text-align: left;
//   list-style: none;
//   list-style-type: none;
//   @media (max-width: 991px) {
//     text-align: center;
//   }
// `;

// const Li11 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li12 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li13 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li14 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li15 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li16 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li17 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li18 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Div12 = styled.div`
//   border-top: 0px;
//   text-align: left;
//   @media (max-width: 991px) {
//     border-top: 1px solid rgb(234, 238, 245);
//     border-top-color: rgb(234, 238, 245);
//     border-top-style: solid;
//     border-top-width: 1px;
//     text-align: center;
//   }
// `;

// const Ul4 = styled.ul`
//   padding-inline-start: 0;
//   text-align: left;
//   list-style: none;
//   list-style-type: none;
//   @media (max-width: 991px) {
//     text-align: center;
//   }
// `;

// const Li19 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li20 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li21 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li22 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li23 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li24 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li25 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Div13 = styled.div`
//   border-top: 0px;
//   text-align: left;
//   @media (max-width: 991px) {
//     border-top: 1px solid rgb(234, 238, 245);
//     border-top-color: rgb(234, 238, 245);
//     border-top-style: solid;
//     border-top-width: 1px;
//     text-align: center;
//   }
// `;

// const Ul5 = styled.ul`
//   padding-inline-start: 0;
//   text-align: left;
//   list-style: none;
//   list-style-type: none;
//   @media (max-width: 991px) {
//     text-align: center;
//   }
// `;

// const Li26 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li27 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li28 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li29 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Li30 = styled.li`
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   text-align: left;
//   padding-left: 20px;
//   margin-bottom: 15px;
//   margin-top: 15px;
//   font-weight: 100;
//   letter-spacing: 1px;
//   display: block;
//   transition: background 0.2s ease 0s;
//   transition-duration: 0.2s;
//   transition-property: background;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
//   @media (max-width: 991px) {
//     color: #999;
//     font-size: 14px;
//     text-align: center;
//     padding-left: 0px;
//     margin-bottom: 28px;
//     margin-top: 28px;
//   }
// `;

// const Ul6 = styled.ul`
//   padding-inline-start: 0;
//   margin-bottom: 8px;
//   display: inline-block;
//   margin-left: 8px;
//   margin-right: 8px;
//   margin-top: 8px;
//   @media (max-width: 991px) {
//     margin-bottom: 16px;
//     margin-left: 16px;
//     margin-right: 0px;
//     margin-top: 0px;
//     display: block;
//   }
// `;

// const Li31 = styled.li`
//   display: inline-block;
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   margin-left: 8px;
//   margin-right: 8px;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
// `;

// const Li32 = styled.li`
//   display: inline-block;
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   margin-left: 8px;
//   margin-right: 8px;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
// `;

// const Li33 = styled.li`
//   display: inline-block;
//   color: rgb(103, 112, 127);
//   font-size: 13px;
//   margin-left: 8px;
//   margin-right: 8px;
//   cursor: pointer;
//   text-decoration: none;
//   background-color: transparent;
// `;

// const P = styled.p`
//   display: inline-block;
//   color: rgb(103, 112, 127);
//   font-size: 11px;
//   @media (max-width: 991px) {
//     padding-bottom: 8px;
//     display: block;
//   }
// `;
