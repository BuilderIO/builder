import React, { useState } from 'react';
import { BuilderContent } from '@builder.io/react';
import { ProductsList } from '../components/ProductsList/ProductsList';
import styled from 'styled-components';

// This is a "pure headless data" homepage example.
// Use this as reference for using Builder data models w/ React.
// Note: the styled-components library is used for easier styling.

const HeroContainer = styled.a`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  height: auto;
  margin-top: -3px;
  position: relative;
  width: 100vw;
  padding-top: 27px;
  align-self: stretch;
  margin-left: calc(50% - 50vw);
  padding-left: 0px;
  padding-right: 0px;
  background-color: rgba(255, 255, 255, 1);
  color: rgba(186, 202, 255, 1);
  background-image: ${props =>
    'url(' +
    (props.backgroundImage ||
      'https://cdn.builder.io/api/v1/image/assets%2FbqNZC3dTGjwbxXySE419%2F0fb37235a9c94992b4400cbfbe884778?width=2000') +
    ')'};
  cursor: pointer;
  pointer-events: auto;
  flex-grow: 0;
  padding-bottom: 100px;
  @media (max-width: 991px) {
    margin-right: -1283.20703125px;
    margin-top: 0px;
    height: auto;
    margin-left: 0px;
    background-size: cover;
    background-position: top;
    display: flex;
    padding-bottom: 60px;
    background-image: url(https://cdn.builder.io/api/v1/image/assets%2FbqNZC3dTGjwbxXySE419%2Fc4dd6e27c2be41eea5aec91f1a35b862?width=998);
    flex-grow: 0;
  }
  @media (max-width: 640px) {
    height: auto;
    margin-right: auto;
    margin-left: auto;
    margin-top: -1px;
    background-size: cover;
    background-position: center;
    padding-top: 36px;
    padding-left: 0px;
    background-image: url(https://cdn.builder.io/api/v1/image/assets%2FbqNZC3dTGjwbxXySE419%2F50e11d77c80944949801093f23254ceb?width=638);
    flex-grow: 0;
    padding-bottom: 80px;
  }
`;

const HeroTopText = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 10px;
  width: auto;
  align-self: stretch;
  @media (max-width: 640px) {
    padding-bottom: 1px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroHeader = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: center;
  font-size: 23px;
  font-family: sans-serif, sans-serif;
  color: rgba(102, 102, 102, 1);
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 75px;
  font-weight: 600;
  letter-spacing: 3px;
  @media (max-width: 991px) {
    margin-top: 31px;
    letter-spacing: 2px;
    font-size: 22px;
    width: auto;
    align-self: stretch;
  }
  @media (max-width: 640px) {
    font-size: 16px;
    margin-top: 7.34375px;
    letter-spacing: 1.2px;
    padding-right: 0px;
    padding-left: 0px;
    padding-bottom: 0px;
    width: auto;
    align-self: stretch;
    font-weight: 600;
    display: none;
  }
`;

const Block1 = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  @media (max-width: 991px) {
    margin-top: 30px;
  }
  @media (max-width: 640px) {
    margin-top: 20px;
  }
`;

const HeroTitle = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: center;
  height: auto;
  font-size: 80px;
  font-family: sans-serif, sans-serif;
  color: rgba(0, 0, 0, 1);
  font-weight: 600;
  letter-spacing: 0px;
  margin-left: auto;
  margin-top: -39.5px;
  margin-right: auto;
  padding-left: 0px;
  padding-right: 8px;
  width: 949.1875px;
  line-height: 120px;
  background-color: rgba(109, 115, 177, 0);
  @media (max-width: 991px) {
    font-size: 80px;
    margin-top: -17px;
    margin-left: auto;
    width: 531px;
    line-height: 83px;
    margin-right: auto;
  }
  @media (max-width: 640px) {
    width: auto;
    font-size: 32px;
    margin-left: 3px;
    margin-top: -32px;
    padding-bottom: 0px;
    display: none;
  }
`;

const HeroSubtitle = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: center;
  font-size: 27px;
  font-family: sans-serif, sans-serif;
  color: rgba(90, 90, 90, 1);
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  width: 887.3671875px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0px;
  letter-spacing: 0.5px;
  font-weight: 500;
  line-height: 37px;
  @media (max-width: 991px) {
    width: 370.8427734375px;
    font-size: 24px;
    margin-top: 11px;
    letter-spacing: 0px;
    padding-left: 13px;
    padding-right: 13px;
    line-height: 34px;
  }
  @media (max-width: 640px) {
    font-size: 18px;
    letter-spacing: 0px;
    line-height: 28px;
    align-self: stretch;
    padding-right: 0px;
    padding-left: 0px;
    padding-bottom: 0px;
    margin-top: 12px;
    width: 260.501953125px;
  }
`;

const HeroCta = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: center;
  height: auto;
  font-size: 16px;
  font-family: sans-serif, sans-serif;
  color: rgba(0, 0, 0, 1);
  margin-left: auto;
  padding-bottom: 0px;
  margin-right: auto;
  font-weight: 700;
  letter-spacing: 1px;
  text-decoration: underline;
  margin-top: 63px;
  @media (max-width: 991px) {
    margin-top: 37px;
  }
  @media (max-width: 640px) {
    margin-top: 30px;
  }
`;

const SecondaryBannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 24px;
  height: 90vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background-image: ${props =>
    'url(' +
    (props.backgroundImage ||
      'https://cdn.builder.io/api/v1/image/assets%2Ffdbd25dbc32e4eb7a62b2e2389bb946b%2Fa400e9af9c2646ae9ef0a68784e74479') +
    ');'};
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  @media (max-width: 991px) {
    padding-bottom: 0px;
    height: 500px;
  }
`;

const Div9 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: auto;
  height: auto;
  margin-bottom: auto;
  padding-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 900px;
`;

const SecondaryBannerTitle = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  font-family: sans-serif, sans-serif;
  color: ${props => props.textColor || 'rgba(255, 255, 255, 1)'};
  font-size: 82px;
  background-color: ${props => (props.isTextOverlayShown ? 'rgba(3, 2, 2, 0.38)' : 'transparent')};
  opacity: 1;
  border-radius: 5px;
  @media (max-width: 991px) {
    font-size: 52px;
  }
  @media (max-width: 640px) {
    font-size: 39px;
  }
`;

const SecondaryBannerCta = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 18px;
  padding-left: 29px;
  padding-bottom: 18px;
  padding-right: 29px;
  background-color: ${props => props.buttonColor || 'rgba(255, 255, 255, 1)'};
  color: ${props => props.buttonTextColor || 'black'};
  letter-spacing: 2px;
  font-size: 12px;
  font-family: sans-serif, sans-serif;
  cursor: pointer;
  pointer-events: auto;
`;

const Div12 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 24px;
  margin-top: 24px;
`;

const Div13 = styled.div`
  display: flex;
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Div14 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: calc(33.333333333333336% - 13.333333333333334px);
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div15 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 15px;
  height: 25vh;
  background-image: url(https://cdn.builder.codes/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2F535b441b503945e5aaf8dddecf05c274?width=1000&height=1000);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

const Div16 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: auto;
  height: auto;
  margin-bottom: auto;
  padding-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 900px;
`;

const Div17 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  font-family: Julius Sans One, sans-serif;
  color: rgba(255, 255, 255, 1);
  font-size: 43px;
  @media (max-width: 640px) {
    font-size: 32px;
  }
`;

const Div18 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 11px;
  padding-left: 21px;
  padding-bottom: 11px;
  padding-right: 21px;
  background-color: rgba(255, 255, 255, 1);
  letter-spacing: 2px;
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
`;

const Div19 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: calc(33.333333333333336% - 13.333333333333334px);
  margin-left: 20px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div20 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 15px;
  height: 25vh;
  background-image: url(https://cdn.builder.codes/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Fb6ca4e08d9494ceebcdbcfc737199986?width=1000&height=1000);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

const Div21 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: auto;
  height: auto;
  margin-bottom: auto;
  padding-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 900px;
`;

const Div22 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  font-family: Julius Sans One, sans-serif;
  color: rgba(255, 255, 255, 1);
  font-size: 43px;
  @media (max-width: 640px) {
    font-size: 32px;
  }
`;

const Div23 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 11px;
  padding-left: 21px;
  padding-bottom: 11px;
  padding-right: 21px;
  background-color: rgba(255, 255, 255, 1);
  letter-spacing: 2px;
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
`;

const Div24 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: calc(33.333333333333336% - 13.333333333333334px);
  margin-left: 20px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div25 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 15px;
  height: 25vh;
  background-image: url(https://cdn.builder.codes/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Fc80a211bc0c24edd83ba91f481cf57eb?width=1000&height=1000);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

const Div26 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: auto;
  height: auto;
  margin-bottom: auto;
  padding-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 900px;
`;

const Div27 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  font-family: Julius Sans One, sans-serif;
  color: rgba(255, 255, 255, 1);
  font-size: 43px;
  @media (max-width: 640px) {
    font-size: 32px;
  }
`;

const Div28 = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
  line-height: normal;
  height: auto;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 11px;
  padding-left: 21px;
  padding-bottom: 11px;
  padding-right: 21px;
  background-color: rgba(255, 255, 255, 1);
  letter-spacing: 2px;
  font-size: 12px;
  cursor: pointer;
  pointer-events: auto;
`;

const ProductsList1 = styled(ProductsList)`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 20px;
`;

export function HomepageFullHeadless() {
  return (
    <>
      <BuilderContent modelName="homepage-headless-content">
        {(data, loading) => (
          <div>
            <HeroContainer
              href={data?.heroBanner?.ctaUrl || '/collections'}
              backgroundImage={data?.heroBanner?.backgroundImage}
            >
              <HeroTopText>
                <HeroHeader>
                  <span>{data?.heroBanner?.header || 'WHY WAIT?'}</span>
                </HeroHeader>
                <Block1>
                  <HeroTitle>
                    <p>{data?.heroBanner?.title || 'The New Sale is On.'}</p>
                  </HeroTitle>
                </Block1>
              </HeroTopText>
              <HeroSubtitle>
                <p>
                  {data?.heroBanner?.subtitle || 'Browse the exclusive early-access collection.'}
                </p>
              </HeroSubtitle>
              <HeroCta>
                <span>{data?.heroBanner?.cta || 'SHOP NOW'}</span>
              </HeroCta>
            </HeroContainer>

            <div>
              {data?.secondaryBanners?.map((item, index) => (
                <SecondaryBannerContainer key={index} backgroundImage={item.banner.backgroundImage}>
                  <Div9>
                    <SecondaryBannerTitle
                      isTextOverlayShown={item.banner.isTextOverlayShown}
                      textColor={item.banner.textColor}
                    >
                      <p>{item.banner.title}</p>
                    </SecondaryBannerTitle>
                    <SecondaryBannerCta
                      href={item.banner.ctaUrl}
                      buttonColor={item.banner.buttonColor}
                      buttonTextColor={item.banner.buttonTextColor}
                    >
                      <p>{item.banner.cta}</p>
                    </SecondaryBannerCta>
                  </Div9>
                </SecondaryBannerContainer>
              ))}
            </div>

            <div>
              {data?.isCategoryRowShown ? (
                <Div12>
                  <Div13 className="builder-columns">
                    <Div14 className="builder-column">
                      <Div15>
                        <Div16>
                          <Div17>
                            <p>jeans</p>
                          </Div17>
                          <Div18 href="/collections">
                            <p>SHOP NOW</p>
                          </Div18>
                        </Div16>
                      </Div15>
                    </Div14>
                    <Div19 className="builder-column">
                      <Div20>
                        <Div21>
                          <Div22>
                            <p>sweaters</p>
                          </Div22>
                          <Div23 href="/collections">
                            <p>SHOP NOW</p>
                          </Div23>
                        </Div21>
                      </Div20>
                    </Div19>
                    <Div24 className="builder-column">
                      <Div25>
                        <Div26>
                          <Div27>
                            <p>hats</p>
                          </Div27>
                          <Div28 href="/collections">
                            <p>SHOP NOW</p>
                          </Div28>
                        </Div26>
                      </Div25>
                    </Div24>
                  </Div13>
                </Div12>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}
      </BuilderContent>

      <ProductsList1 category="living" size="Medium" amount={20}></ProductsList1>
    </>
  );
}
