import { CommerceAPIOperations } from "@builder.io/commerce-plugin-tools";

const RESOURCE_TYPES: {
  name: string;
  id: string;
  description: string;
}[] = [
  {
    name: 'Product',
    id: 'product',
    description: 'All of your Salesforce products.',
  },
  {
    name: 'Category',
    id: 'category',
    description: 'All of your Salesforce collections.',
  }
];

export const dataProvider = (service: CommerceAPIOperations) => ({
  name: 'Saleforce',
  icon: 'https://c1.sfdcstatic.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg',
  getResourceTypes: async () =>
    RESOURCE_TYPES.map(
      (model) => ({
        ...model,
        inputs: () => [
          { friendlyName: ` `, name: model.id, type: `Salesforce${model.name}` },
        ],
        toUrl: (options: any) => {
          if (options[model.id]) {
            return options[model.id].request.url
          }
          return '';
        },
        canPickEntries: false,
      })
    ),
});