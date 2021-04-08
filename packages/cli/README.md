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
