import { expect } from '@playwright/test';
import { excludeGen1, excludeTestFor, test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const countriesResponse = {
  data: {
    countries: [
      {
        name: 'Andorra',
      },
      {
        name: 'United Arab Emirates',
      },
      {
        name: 'Afghanistan',
      },
      {
        name: 'Antigua and Barbuda',
      },
      {
        name: 'Anguilla',
      },
      {
        name: 'Albania',
      },
      {
        name: 'Armenia',
      },
      {
        name: 'Angola',
      },
      {
        name: 'Antarctica',
      },
      {
        name: 'Argentina',
      },
      {
        name: 'American Samoa',
      },
      {
        name: 'Austria',
      },
      {
        name: 'Australia',
      },
      {
        name: 'Aruba',
      },
      {
        name: 'Åland',
      },
      {
        name: 'Azerbaijan',
      },
      {
        name: 'Bosnia and Herzegovina',
      },
      {
        name: 'Barbados',
      },
      {
        name: 'Bangladesh',
      },
      {
        name: 'Belgium',
      },
      {
        name: 'Burkina Faso',
      },
      {
        name: 'Bulgaria',
      },
      {
        name: 'Bahrain',
      },
      {
        name: 'Burundi',
      },
      {
        name: 'Benin',
      },
      {
        name: 'Saint Barthélemy',
      },
      {
        name: 'Bermuda',
      },
      {
        name: 'Brunei',
      },
      {
        name: 'Bolivia',
      },
      {
        name: 'Bonaire',
      },
      {
        name: 'Brazil',
      },
      {
        name: 'Bahamas',
      },
      {
        name: 'Bhutan',
      },
      {
        name: 'Bouvet Island',
      },
      {
        name: 'Botswana',
      },
      {
        name: 'Belarus',
      },
      {
        name: 'Belize',
      },
      {
        name: 'Canada',
      },
      {
        name: 'Cocos [Keeling] Islands',
      },
      {
        name: 'Democratic Republic of the Congo',
      },
      {
        name: 'Central African Republic',
      },
      {
        name: 'Republic of the Congo',
      },
      {
        name: 'Switzerland',
      },
      {
        name: 'Ivory Coast',
      },
      {
        name: 'Cook Islands',
      },
      {
        name: 'Chile',
      },
      {
        name: 'Cameroon',
      },
      {
        name: 'China',
      },
      {
        name: 'Colombia',
      },
      {
        name: 'Costa Rica',
      },
      {
        name: 'Cuba',
      },
      {
        name: 'Cape Verde',
      },
      {
        name: 'Curacao',
      },
      {
        name: 'Christmas Island',
      },
      {
        name: 'Cyprus',
      },
      {
        name: 'Czech Republic',
      },
      {
        name: 'Germany',
      },
      {
        name: 'Djibouti',
      },
      {
        name: 'Denmark',
      },
      {
        name: 'Dominica',
      },
      {
        name: 'Dominican Republic',
      },
      {
        name: 'Algeria',
      },
      {
        name: 'Ecuador',
      },
      {
        name: 'Estonia',
      },
      {
        name: 'Egypt',
      },
      {
        name: 'Western Sahara',
      },
      {
        name: 'Eritrea',
      },
      {
        name: 'Spain',
      },
      {
        name: 'Ethiopia',
      },
      {
        name: 'Finland',
      },
      {
        name: 'Fiji',
      },
      {
        name: 'Falkland Islands',
      },
      {
        name: 'Micronesia',
      },
      {
        name: 'Faroe Islands',
      },
      {
        name: 'France',
      },
      {
        name: 'Gabon',
      },
      {
        name: 'United Kingdom',
      },
      {
        name: 'Grenada',
      },
      {
        name: 'Georgia',
      },
      {
        name: 'French Guiana',
      },
      {
        name: 'Guernsey',
      },
      {
        name: 'Ghana',
      },
      {
        name: 'Gibraltar',
      },
      {
        name: 'Greenland',
      },
      {
        name: 'Gambia',
      },
      {
        name: 'Guinea',
      },
      {
        name: 'Guadeloupe',
      },
      {
        name: 'Equatorial Guinea',
      },
      {
        name: 'Greece',
      },
      {
        name: 'South Georgia and the South Sandwich Islands',
      },
      {
        name: 'Guatemala',
      },
      {
        name: 'Guam',
      },
      {
        name: 'Guinea-Bissau',
      },
      {
        name: 'Guyana',
      },
      {
        name: 'Hong Kong',
      },
      {
        name: 'Heard Island and McDonald Islands',
      },
      {
        name: 'Honduras',
      },
      {
        name: 'Croatia',
      },
      {
        name: 'Haiti',
      },
      {
        name: 'Hungary',
      },
      {
        name: 'Indonesia',
      },
      {
        name: 'Ireland',
      },
      {
        name: 'Israel',
      },
      {
        name: 'Isle of Man',
      },
      {
        name: 'India',
      },
      {
        name: 'British Indian Ocean Territory',
      },
      {
        name: 'Iraq',
      },
      {
        name: 'Iran',
      },
      {
        name: 'Iceland',
      },
      {
        name: 'Italy',
      },
      {
        name: 'Jersey',
      },
      {
        name: 'Jamaica',
      },
      {
        name: 'Jordan',
      },
      {
        name: 'Japan',
      },
      {
        name: 'Kenya',
      },
      {
        name: 'Kyrgyzstan',
      },
      {
        name: 'Cambodia',
      },
      {
        name: 'Kiribati',
      },
      {
        name: 'Comoros',
      },
      {
        name: 'Saint Kitts and Nevis',
      },
      {
        name: 'North Korea',
      },
      {
        name: 'South Korea',
      },
      {
        name: 'Kuwait',
      },
      {
        name: 'Cayman Islands',
      },
      {
        name: 'Kazakhstan',
      },
      {
        name: 'Laos',
      },
      {
        name: 'Lebanon',
      },
      {
        name: 'Saint Lucia',
      },
      {
        name: 'Liechtenstein',
      },
      {
        name: 'Sri Lanka',
      },
      {
        name: 'Liberia',
      },
      {
        name: 'Lesotho',
      },
      {
        name: 'Lithuania',
      },
      {
        name: 'Luxembourg',
      },
      {
        name: 'Latvia',
      },
      {
        name: 'Libya',
      },
      {
        name: 'Morocco',
      },
      {
        name: 'Monaco',
      },
      {
        name: 'Moldova',
      },
      {
        name: 'Montenegro',
      },
      {
        name: 'Saint Martin',
      },
      {
        name: 'Madagascar',
      },
      {
        name: 'Marshall Islands',
      },
      {
        name: 'North Macedonia',
      },
      {
        name: 'Mali',
      },
      {
        name: 'Myanmar [Burma]',
      },
      {
        name: 'Mongolia',
      },
      {
        name: 'Macao',
      },
      {
        name: 'Northern Mariana Islands',
      },
      {
        name: 'Martinique',
      },
      {
        name: 'Mauritania',
      },
      {
        name: 'Montserrat',
      },
      {
        name: 'Malta',
      },
      {
        name: 'Mauritius',
      },
      {
        name: 'Maldives',
      },
      {
        name: 'Malawi',
      },
      {
        name: 'Mexico',
      },
      {
        name: 'Malaysia',
      },
      {
        name: 'Mozambique',
      },
      {
        name: 'Namibia',
      },
      {
        name: 'New Caledonia',
      },
      {
        name: 'Niger',
      },
      {
        name: 'Norfolk Island',
      },
      {
        name: 'Nigeria',
      },
      {
        name: 'Nicaragua',
      },
      {
        name: 'Netherlands',
      },
      {
        name: 'Norway',
      },
      {
        name: 'Nepal',
      },
      {
        name: 'Nauru',
      },
      {
        name: 'Niue',
      },
      {
        name: 'New Zealand',
      },
      {
        name: 'Oman',
      },
      {
        name: 'Panama',
      },
      {
        name: 'Peru',
      },
      {
        name: 'French Polynesia',
      },
      {
        name: 'Papua New Guinea',
      },
      {
        name: 'Philippines',
      },
      {
        name: 'Pakistan',
      },
      {
        name: 'Poland',
      },
      {
        name: 'Saint Pierre and Miquelon',
      },
      {
        name: 'Pitcairn Islands',
      },
      {
        name: 'Puerto Rico',
      },
      {
        name: 'Palestine',
      },
      {
        name: 'Portugal',
      },
      {
        name: 'Palau',
      },
      {
        name: 'Paraguay',
      },
      {
        name: 'Qatar',
      },
      {
        name: 'Réunion',
      },
      {
        name: 'Romania',
      },
      {
        name: 'Serbia',
      },
      {
        name: 'Russia',
      },
      {
        name: 'Rwanda',
      },
      {
        name: 'Saudi Arabia',
      },
      {
        name: 'Solomon Islands',
      },
      {
        name: 'Seychelles',
      },
      {
        name: 'Sudan',
      },
      {
        name: 'Sweden',
      },
      {
        name: 'Singapore',
      },
      {
        name: 'Saint Helena',
      },
      {
        name: 'Slovenia',
      },
      {
        name: 'Svalbard and Jan Mayen',
      },
      {
        name: 'Slovakia',
      },
      {
        name: 'Sierra Leone',
      },
      {
        name: 'San Marino',
      },
      {
        name: 'Senegal',
      },
      {
        name: 'Somalia',
      },
      {
        name: 'Suriname',
      },
      {
        name: 'South Sudan',
      },
      {
        name: 'São Tomé and Príncipe',
      },
      {
        name: 'El Salvador',
      },
      {
        name: 'Sint Maarten',
      },
      {
        name: 'Syria',
      },
      {
        name: 'Swaziland',
      },
      {
        name: 'Turks and Caicos Islands',
      },
      {
        name: 'Chad',
      },
      {
        name: 'French Southern Territories',
      },
      {
        name: 'Togo',
      },
      {
        name: 'Thailand',
      },
      {
        name: 'Tajikistan',
      },
      {
        name: 'Tokelau',
      },
      {
        name: 'East Timor',
      },
      {
        name: 'Turkmenistan',
      },
      {
        name: 'Tunisia',
      },
      {
        name: 'Tonga',
      },
      {
        name: 'Turkey',
      },
      {
        name: 'Trinidad and Tobago',
      },
      {
        name: 'Tuvalu',
      },
      {
        name: 'Taiwan',
      },
      {
        name: 'Tanzania',
      },
      {
        name: 'Ukraine',
      },
      {
        name: 'Uganda',
      },
      {
        name: 'U.S. Minor Outlying Islands',
      },
      {
        name: 'United States',
      },
      {
        name: 'Uruguay',
      },
      {
        name: 'Uzbekistan',
      },
      {
        name: 'Vatican City',
      },
      {
        name: 'Saint Vincent and the Grenadines',
      },
      {
        name: 'Venezuela',
      },
      {
        name: 'British Virgin Islands',
      },
      {
        name: 'U.S. Virgin Islands',
      },
      {
        name: 'Vietnam',
      },
      {
        name: 'Vanuatu',
      },
      {
        name: 'Wallis and Futuna',
      },
      {
        name: 'Samoa',
      },
      {
        name: 'Kosovo',
      },
      {
        name: 'Yemen',
      },
      {
        name: 'Mayotte',
      },
      {
        name: 'South Africa',
      },
      {
        name: 'Zambia',
      },
      {
        name: 'Zimbabwe',
      },
    ],
  },
};

test.describe('HTTP Requests', () => {
  test('call proxy API only once - in page', async ({ page, packageName, sdk }) => {
    test.skip(excludeGen1(sdk));
    test.fail(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({
        status: 200,
        json: { entries: [{ seo_title: 'foo' }] },
      });
    });

    await page.goto('/http-requests', { waitUntil: 'networkidle' });
    await expect(page.locator('body').getByText('foo')).toBeVisible();
    expect(x).toBe(1);
  });

  test('call POST API only once - in page', async ({ page, packageName, sdk }) => {
    test.fail(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /^https:\/\/countries\.trevorblades\.com\/graphql$/;

    await page.route(urlMatch, route => {
      if (route.request().method() === 'POST') {
        x++;

        if (x > 10) {
          throw new Error('Too many POST API requests.');
        }
        return route.fulfill({
          status: 200,
          json: countriesResponse,
        });
      }
    });

    await page.goto('/http-requests', { waitUntil: 'networkidle' });
    for (const country of countriesResponse.data.countries) {
      await expect(page.locator('body').getByText(country.name, { exact: true })).toBeVisible();
    }
    expect(x).toBe(1);
  });

  test('call proxy API only once - in editor', async ({ page, basePort, packageName, sdk }) => {
    test.skip(excludeGen1(sdk));
    test.skip(
      packageName === 'react-native-74' || packageName === 'react-native-76-fabric',
      'editor tests not supported in react-native'
    );
    test.skip(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({
        status: 200,
        json: { entries: [{ seo_title: 'foo' }] },
      });
    });

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/http-requests',
      sdk,
      gotoOptions: { waitUntil: 'networkidle' },
    });

    await expect(page.frameLocator('iframe').getByText('foo')).toBeVisible();

    // expect(x).toBeGreaterThanOrEqual(1);
    // eventually this should be exactly 1
    // expect(x).toBeLessThan(10);
    expect(x).toBe(1);
  });

  test('call POST API only once - in editor', async ({ page, basePort, packageName, sdk }) => {
    test.skip(
      packageName === 'react-native-74' || packageName === 'react-native-76-fabric',
      'editor tests not supported in react-native'
    );
    test.skip(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /^https:\/\/countries\.trevorblades\.com\/graphql$/;

    await page.route(urlMatch, route => {
      if (route.request().method() === 'POST') {
        x++;

        if (x > 10) {
          throw new Error('Too many proxy API requests.');
        }

        return route.fulfill({
          status: 200,
          json: countriesResponse,
        });
      }
    });

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/http-requests',
      sdk,
      gotoOptions: { waitUntil: 'networkidle' },
    });

    for (const country of countriesResponse.data.countries) {
      await expect(
        page.frameLocator('iframe').getByText(country.name, { exact: true })
      ).toBeVisible();
    }

    expect(x).toBe(1);
  });
});
