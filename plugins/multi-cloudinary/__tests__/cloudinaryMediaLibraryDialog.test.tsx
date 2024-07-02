/* tslint:disable:no-empty */
import 'jest';
import React from 'react';
import { mount } from 'enzyme';
import { CloudinaryMediaLibraryDialog, CloudinaryImage } from '../src/CloudinaryMediaLibraryDialog';
import { Button } from '@material-ui/core';

import TestConstants from './TestConstants';

describe('Cloudinary Media Library dialog', () => {
  const window = global as any;
  let cloudinaryWidgetInsertHandlerCallback: any;
  let cloudinarySetCredentials: any;
  let cloudinaryModule: any;

  describe('when dialog is rendered', () => {
    beforeEach(() => {
      cloudinaryModule = {
        createMediaLibrary: (settings: any, callbacks: any) => {
          cloudinarySetCredentials = settings;
          cloudinaryWidgetInsertHandlerCallback = callbacks.insertHandler;
          return { show: (showOptions: any) => {} };
        },
      };

      window.cloudinary = cloudinaryModule;
    });

    it('should pass the first selected asset as the image', () => {
      let selectedImage = {};

      mount(
        <CloudinaryMediaLibraryDialog
          openDialog={true}
          apiKey={TestConstants.CLOUDINARY_API_KEY}
          cloudName={TestConstants.CLOUDINARY_CLOUDNAME}
          closeDialog={() => {}}
          selectImage={(image: CloudinaryImage) => {
            selectedImage = image;
          }}
        />
      );

      cloudinaryWidgetInsertHandlerCallback(TestConstants.CLOUDINARY_DATA);

      expect(selectedImage).toStrictEqual(TestConstants.CLOUDINARY_DATA.assets[0]);
    });

    it('should set credentials to empty string if credentials props are undefined', () => {
      mount(
        <CloudinaryMediaLibraryDialog
          openDialog={true}
          apiKey={undefined}
          cloudName={undefined}
          closeDialog={() => {}}
          selectImage={(image: CloudinaryImage) => {}}
        />
      );

      expect(cloudinarySetCredentials.api_key).toBe('');
      expect(cloudinarySetCredentials.cloud_name).toBe('');
    });

    it('should close the dialog when clicking the close button', () => {
      let callbackWasCalled = false;
      const cloudinaryMediaLibraryDialog = mount(
        <CloudinaryMediaLibraryDialog
          openDialog={true}
          apiKey={undefined}
          cloudName={undefined}
          closeDialog={() => {
            callbackWasCalled = true;
          }}
          selectImage={(image: CloudinaryImage) => {}}
        />
      );

      const closeDialogButton = cloudinaryMediaLibraryDialog.find(Button).last();

      closeDialogButton.simulate('click');

      expect(callbackWasCalled).toBe(true);
    });
  });
});
