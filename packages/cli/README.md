# Builder.io CLI

Builder.io CLI, experimental.

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)

<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @builder.io/cli
$ builder COMMAND
USAGE
  $ builder COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`builder import`](#builder-import--k-private-key---o-output-directory)
- [`builder create`](#builder-create)
- [`builder integrate`](#builder-integrate)

## `builder import -k [PRIVATE KEY] -o [OUTPUT DIRECTORY]`

Import your space to the local filesystem.

```
USAGE
  $ builder import -k [PRIVATE KEY] -o [OUTPUT DIRECTORY]


OPTIONS
  -k, --key Private key of the space you want to import

  -d, --debug  Optionally print debug information and progress bars.

  -o, --output  Optionally output directory, default to ./builder

DESCRIPTION
  This command will download a self-contained clone ( new IDs) from the target space and save it on the filesystem.
```

## `builder create -k [PRIVATE KEY] -i [INPUT DIRECTORY] -n [NEW SPACE NAME]`

Create a new space from your local builder directory, as a space under the root organization you specify.

```
USAGE
  $ builder create -k [PRIVATE KEY] -i [INPUT DIRECTORY]


OPTIONS
  -n, --name   The new space name

  -k, --key Private key of the root organization you want to import

  -d, --debug  Optionally print debug information and progress bars.

  -o, --input   Optionally input directory, default to ./builder

DESCRIPTION
  This command will create a new space clone from your local builder directory.
```

## `builder integrate`

Integrates Builder with an existing Next.js project. Currently supports "page" models by creating a catchall route that fetches Builder content that matches the current path.

If you want don't want the catch-all at the route of your `pages` directory, you can add a `--pathPrefix` to nest the route under a different path.

```
Usage:
  $ builder integrate [options]

integrate Builder.io with an existing codebase, currently supports Next.js

Options:
  -d,--debug                print debugging information
  -s,--stack <stack>        currently supports nextjs (default: "nextjs")
  -m,--model <model>        name of the model you want to integrate
  -a,--apiKey <apiKey>      you can find your apiKey on builder.io/account/settings
  -p,--pathPrefix <prefix>  URL path prefix where all your landing pages will be nested under (default: "")
  -h, --help                output usage information
```

## Developing

### **dev**

`npm run dev`

Runs `npm build` whenever files change.

### **clean**

`npm run clean`

Removes any built code and any built executables.

### **build**

`npm run build`

Cleans, then builds the TypeScript code.

Your built code will be in the `./dist/` directory.

### **test**

`npm run test`

Cleans, then builds, and tests the built code.

### **bundle**

`npm run bundle`

Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

Your shareable executables will be in the `./exec/` directory.
