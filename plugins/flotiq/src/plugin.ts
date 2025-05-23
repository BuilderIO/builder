import { registerDataPlugin } from "@builder.io/data-plugin-tools";
import pkg from "../package.json";

const pluginId = pkg.name;
const DEFAULT_LIMIT = 100;
const DEFAULT_HYDRATION_LEVEL = "1";
const HYDRATION_LEVELS = ["0", "1", "2"];

interface ListingOptions {
  limit?: number,
  page?: number
  hydrate?: string,
  order_by?: string,
  order_direction?: string,
}

interface FlotiqType {
  name: string;
  label: string;
  metaDefinition: {
    propertiesConfig: Record<string, { label?: string }>
  };
  schemaDefinition: {
    allOf: any[];
  };
}

const buildParams = (options?: ListingOptions) => {

  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(options  || {})) {
    if (value !== undefined) {
      filteredParams[key] = value.toString();
    }
  }

  return new URLSearchParams(filteredParams).toString();
};

registerDataPlugin(
  {
    id: pluginId,
    name: "Flotiq",
    icon: "https://api.flotiq.com/image/64x64/_media-286ad08f-1108-44c2-9970-b79878df9f6f/logotype.png",
    settings: [
      {
        name: "apiKey",
        friendlyName: "Flotiq API Key",
        type: "string",
        required: true,
        helperText: "Enter your Flotiq API Key from the Flotiq dashboard.",
      }
    ],
    ctaText: "Connect your Flotiq account",
  },
  async (settings) => {
    const apiKey = settings.get("apiKey")?.trim();

    return {
      async getResourceTypes() {
        try {
          const res = await fetch(`https://api.flotiq.com/api/v1/internal/contenttype?auth_token=${apiKey}&limit=1000`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch content types from Flotiq.");
          }

          const data = await res.json()
          const orderFields = [
              {
                value: "internal.createdAt",
                label: "Created At",
              },
              {
                value: "internal.updatedAt",
                label: "Updated At",
              },
              {
                value: "internal.publishedAt",
                label: "Published At",
              }
          ]

          return data.data.map((type: FlotiqType) => ({
            name: type.label,
            id: type.name,
            canPickEntries: true,
            entryInputs: () => [
              {
                name: "hydrate",
                type: "string",
                defaultValue: DEFAULT_HYDRATION_LEVEL,
                enum: HYDRATION_LEVELS,
                friendlyName: "Hydration level",
              }
            ],
            inputs: () => [
              {
                name: "page",
                type: "number",
                defaultValue: 1,
                min: 1,
                friendlyName: "Page",
              },
              {
                name: "limit",
                type: "number",
                defaultValue: DEFAULT_LIMIT,
                min: 1,
                max: 1000,
                friendlyName: "Limit",
              },
              {
                name: "hydrate",
                type: "string",
                defaultValue: DEFAULT_HYDRATION_LEVEL,
                enum: HYDRATION_LEVELS,
                friendlyName: "Hydration level",
                helperText: "Set hydrate to include related objects. Specify the depth of how many levels deep you want to include.",
              },
              {
                name: 'order_by',
                type: 'string',
                enum: [
                    ...Object.entries(type.schemaDefinition.allOf[1].properties).map(([key, _]) => ({
                      value: key,
                      label: type.metaDefinition.propertiesConfig[key]?.label || key,
                    })),
                    ...orderFields
                ]
              },
              {
                name: 'order_direction',
                type: 'string',
                defaultValue: 'asc',
                enum: [{
                  label: 'Ascending',
                  value: 'asc'
                },
                  {
                    label: 'Descending',
                    value: 'desc'
                  }],
              }
            ],
            toUrl: (options: any) => {
              if (options.entry) {
                const entryParams = buildParams({hydrate: options.hydrate});
                return `https://api.flotiq.com/api/v1/content/${type.name}/${options.entry}?${entryParams}&auth_token=${apiKey}`;
              }

              const params = buildParams(options);
              return `https://api.flotiq.com/api/v1/content/${type.name}?${params}&auth_token=${apiKey}`;
            },
          }));
        } catch (err) {
          console.error("Error fetching Flotiq content types:", err);
          return [];
        }
      },

      async getEntriesByResourceType(typeId: string) {
        try {
          const res = await fetch(
            `https://api.flotiq.com/api/v1/content/${typeId}?&auth_token=${apiKey}&limit=1000`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            throw new Error("Failed to fetch entries from Flotiq.");
          }

          const data = await res.json();
          return data.data.map((entry: any) => ({
            id: entry.id,
            name: entry.internal.objectTitle || entry.title || entry.name || entry.id,
          }));
        } catch (err) {
          console.error("Error fetching entries:", err);
          return [];
        }
      },
    };
  }
)
