import { CloudinaryImage } from '../src/CloudinaryMediaLibraryDialog';

export default class TestsConstants {
  public static readonly CLOUDINARY_PUBLIC_ID: string = 'cloudinary public id';

  public static readonly URL_PATH_US: string = 'us/full/path/to/image';

  public static readonly DERIVED_URL_PATH_US: string = 'us/full/path/to/transformed/image';

  public static readonly CLOUDINARY_API_KEY: string = '1234567890';

  public static readonly CLOUDINARY_CLOUDNAME: string = 'yourcloudname';

  public static readonly TRANSFORMED_CLOUDINARY_IMAGE: CloudinaryImage = {
    context: {
      custom: {
        Culture: 'en-us',
        caption: 'us_caption',
        alt: 'us_alt',
        AssetId: 'us_assetId',
      },
    },
    public_id: 'us_publicId',
    derived: [{ secure_url: TestsConstants.DERIVED_URL_PATH_US }],
    tags: ['some_us_tag'],
    url: TestsConstants.URL_PATH_US,
  };

  public static readonly CLOUDINARY_DATA: any = {
    assets: [TestsConstants.TRANSFORMED_CLOUDINARY_IMAGE],
  };
}
