import 'jest';
import CloudinaryImageEditor from '../src/builder-plugin-cloudinary';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('DummyClass is instantiable', () => {
    expect(new CloudinaryImageEditor({} as any)).toBeInstanceOf(CloudinaryImageEditor);
  });
});
