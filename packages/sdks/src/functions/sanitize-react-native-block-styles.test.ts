import { sanitizeReactNativeBlockStyles } from './sanitize-react-native-block-styles';

describe('sanitizeReactNativeBlockStyles', () => {
  it('should sanitize flex: 1', () => {
    const inputStyle = { flex: '1' };
    const expectedOutputStyle = { flex: 1 };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });

  it('should sanitize margin/padding shorthands of length 1', () => {
    const inputStyle = {
      margin: '10px',
      padding: '20px',
    };
    const expectedOutputStyle = {
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
    };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });

  it('should sanitize margin/padding shorthands of length 2', () => {
    const inputStyle = {
      margin: '10px 20px',
      padding: '30px 40px',
    };
    const expectedOutputStyle = {
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 20,
      marginRight: 20,
      paddingTop: 30,
      paddingBottom: 30,
      paddingLeft: 40,
      paddingRight: 40,
    };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });

  it('should sanitize margin/padding shorthands of length 3', () => {
    const inputStyle = {
      margin: '10px 20px 30px',
      padding: '40px 50px 60px',
    };
    const expectedOutputStyle = {
      marginTop: 10,
      marginBottom: 30,
      marginLeft: 20,
      marginRight: 20,
      paddingTop: 40,
      paddingBottom: 60,
      paddingLeft: 50,
      paddingRight: 50,
    };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });

  it('should sanitize margin/padding shorthands of length 4', () => {
    const inputStyle = {
      margin: '10px 20px 30px 40px',
      padding: '50px 60px 70px 80px',
    };
    const expectedOutputStyle = {
      marginTop: 10,
      marginBottom: 30,
      marginLeft: 40,
      marginRight: 20,
      paddingTop: 50,
      paddingBottom: 70,
      paddingLeft: 80,
      paddingRight: 60,
    };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });

  it('should sanitize pixel values', () => {
    const inputStyle = {
      width: '100px',
      height: '200px',
      borderWidth: '2px',
      borderRadius: '10px',
    };
    const expectedOutputStyle = {
      width: 100,
      height: 200,
      borderWidth: 2,
      borderRadius: 10,
    };
    expect(sanitizeReactNativeBlockStyles(inputStyle)).toEqual(
      expectedOutputStyle
    );
  });
});
