/* tslint:disable:no-empty */
import 'jest';
import React from 'react';
import { mount } from 'enzyme';
import CloudinaryImageEditor from '../src/CloudinaryImageEditor';
import CloudinayCredentialsDialog from '../src/CloudinaryCredentialsDialog';
import { CloudinaryMediaLibraryDialog, CloudinaryImage } from '../src/CloudinaryMediaLibraryDialog';
import { Button, Typography } from '@material-ui/core';

import TestConstants from './TestConstants';

describe('Builder cloudinary plugin', () => {
  const buildContextWithCloudinarySettings = (
    key: string | undefined,
    cloudName: string | undefined
  ) => {
    return {
      user: {
        organization: {
          value: {
            settings: {
              plugins: new Map([
                ['cloudinaryCloud', cloudName],
                ['cloudinaryKey', key],
              ]),
            },
          },
          save: () => {},
        },
      },
    };
  };

  describe('when plugin is rendered with no selected image', () => {
    it('should render `choose image` text in the select image button', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      );
      const chooseImageButton = cloudinaryImageEditor.find(Button).first();

      expect(chooseImageButton.text()).toEqual('CHOOSE IMAGE');
    });
  });

  describe('when plugin is rendered with a selected image', () => {
    it('should render `update image` text in the select image button', () => {
      const value = new Map([['public_id', [TestConstants.CLOUDINARY_PUBLIC_ID]]]);
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
          value={value}
        />
      );
      const chooseImageButton = cloudinaryImageEditor.find(Button).first();
      expect(chooseImageButton.text()).toEqual('UPDATE IMAGE');
    });

    describe('when image has a public id', () => {
      it('should render the public id in the plugin UI', () => {
        const value = new Map([['public_id', [TestConstants.CLOUDINARY_PUBLIC_ID]]]);
        const cloudinaryImageEditor = mount(
          <CloudinaryImageEditor
            context={buildContextWithCloudinarySettings(undefined, undefined)}
            onChange={(image: CloudinaryImage) => {}}
            value={value}
          />
        );
        const publicIdText = cloudinaryImageEditor.find(Typography).last();
        expect(publicIdText.text()).toEqual(`Public id: ${TestConstants.CLOUDINARY_PUBLIC_ID}`);
      });
    });
  });

  describe('when plugin is rendered with no cloudinary settings', () => {
    it('should render choose image button disabled', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      );
      const chooseImageButton = cloudinaryImageEditor.find(Button).first();

      expect(chooseImageButton.prop('disabled')).toEqual(true);
    });

    it('should set the credentials back from the CloudinayCredentialsDialog', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      );
      const credentialsDialog = cloudinaryImageEditor.find(CloudinayCredentialsDialog);

      credentialsDialog
        .props()
        .updateCloudinaryCredentials(
          TestConstants.CLOUDINARY_API_KEY,
          TestConstants.CLOUDINARY_CLOUDNAME
        );

      expect(cloudinaryImageEditor.state('apiKey')).toBe(TestConstants.CLOUDINARY_API_KEY);
      expect(cloudinaryImageEditor.state('cloudName')).toBe(TestConstants.CLOUDINARY_CLOUDNAME);
    });

    it('should close cloudinary settings dialog when user updates the credentials', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      );

      const setCredentialsButton = cloudinaryImageEditor.find(Button).last();
      setCredentialsButton.simulate('click');
      const credentialsDialog = cloudinaryImageEditor.find(CloudinayCredentialsDialog);

      const closeCredentialsButton = credentialsDialog.find(Button).first();
      closeCredentialsButton.simulate('click');

      expect(cloudinaryImageEditor.state('showDialog')).toBe(false);
    });
  });

  describe('when plugin is rendered with cloudinary settings', () => {
    it('should render the cloudinary media library widget', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(
            TestConstants.CLOUDINARY_API_KEY,
            TestConstants.CLOUDINARY_CLOUDNAME
          )}
          onChange={(image: CloudinaryImage) => {
            console.log('image changed');
          }}
        />
      );

      expect(cloudinaryImageEditor.find(CloudinaryMediaLibraryDialog)).toBeDefined();
    });

    describe('when clicking on set credentials button', () => {
      it('should show set credentials dialog', () => {
        const cloudinaryImageEditor = mount(
          <CloudinaryImageEditor
            context={buildContextWithCloudinarySettings(
              TestConstants.CLOUDINARY_API_KEY,
              TestConstants.CLOUDINARY_CLOUDNAME
            )}
            onChange={(image: CloudinaryImage) => {}}
          />
        );
        const setCredentialsButton = cloudinaryImageEditor.find(Button).last();
        setCredentialsButton.simulate('click');

        const cloudinaryCredentialsDialog = cloudinaryImageEditor.find(CloudinayCredentialsDialog);
        expect(cloudinaryCredentialsDialog).toBeDefined();
        expect(cloudinaryCredentialsDialog.exists()).toBe(true);
      });
    });
  });

  describe('when user selects an image from the cloudinary media widget', () => {
    it('should pass the image to onChange ', () => {
      let selectedImage = {};
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(
            TestConstants.CLOUDINARY_API_KEY,
            TestConstants.CLOUDINARY_CLOUDNAME
          )}
          onChange={(image: CloudinaryImage) => {
            selectedImage = image;
          }}
        />
      );

      const pickUpImageButton = cloudinaryImageEditor.find(Button).first();
      pickUpImageButton.simulate('click');
      const mediaLibraryDialog = cloudinaryImageEditor.find(CloudinaryMediaLibraryDialog);

      mediaLibraryDialog.props().selectImage(TestConstants.CLOUDINARY_DATA.assets[0]);

      expect(selectedImage).toBe(TestConstants.CLOUDINARY_DATA.assets[0]);
    });
  });
});
