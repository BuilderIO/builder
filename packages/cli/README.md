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
- [`builder overwrite`](#builder-overwrite--k-private-key---i-input-directory)
- [`builder integrate`](#builder-integrate)

## `builder import -k [PRIVATE KEY] -o [OUTPUT DIRECTORY]`

Import your space to the local filesystem.

```
USAGE
  $ builder import -k [PRIVATE KEY] -o [OUTPUT DIRECTORY]


OPTIONS
  -k, --key Private key of the space you want to import (or set BUILDER_PRIVATE_KEY)

  -d, --debug  Optionally print debug information and progress bars.

  -o, --output  Optionally output directory, default to ./builder

DESCRIPTION
  This command will download a self-contained clone ( new IDs) from the target space and save it on the filesystem.
  The snapshot includes unpublished/draft content entries, not just published ones, so it can be used as a full
  backup of the space (see `builder overwrite` for restoring from it).

  Every import fully replaces the output directory's contents, so a model deleted or renamed since a previous
  snapshot doesn't leave stale data behind. It also refuses to write a snapshot (rather than silently corrupting
  one) if two models would normalize to the same directory name, and always prints a model/entry count summary on
  completion so an incomplete snapshot doesn't go unnoticed until you try to restore from it.

  Known limitation: pagination is offset-based. If content is created after the import starts, it's cleanly
  excluded from the snapshot rather than causing skipped/duplicated entries — but content deleted from the space
  while a large import is still in progress can, in rare cases, cause one other unrelated entry to be skipped.
  For a business-critical backup of a very large space, taking it during a quiet period minimizes this risk.
```

## `builder create -k [PRIVATE KEY] -i [INPUT DIRECTORY] -n [NEW SPACE NAME]`

Create a new space from your local builder directory, as a space under the root organization you specify.

```
USAGE
  $ builder create -k [PRIVATE KEY] -i [INPUT DIRECTORY]


OPTIONS
  -n, --name   The new space name

  -k, --key Private key of the root organization you want to import (or set BUILDER_PRIVATE_KEY)

  -d, --debug  Optionally print debug information and progress bars.

  -o, --input   Optionally input directory, default to ./builder

DESCRIPTION
  This command will create a new space clone from your local builder directory. Content writes use
  PUT (upsert by id) rather than POST, so a retry after a network error or 5xx cannot create a
  duplicate entry.
```

## `builder overwrite -k [PRIVATE KEY] -i [INPUT DIRECTORY]`

Restore a local snapshot into an **existing** space, in place, using its own private key. Unlike `create`, this does not create a new space or mint a new key.

```
USAGE
  $ builder overwrite -k [PRIVATE KEY] -i [INPUT DIRECTORY]


OPTIONS
  -k, --key Private key of the existing space to overwrite (or set BUILDER_PRIVATE_KEY)

  -d, --debug  Optionally print debug information and progress bars.

  -i, --input   Optionally input directory, default to ./builder

  -p, --prune  Also delete content entries in the target space, for models present in the snapshot,
               that are not present in the snapshot. Destructive and cannot be undone.

  -y, --yes    Skip the confirmation prompt for --prune, for non-interactive/scripted use.

  --dry-run    Print what would be created/updated/pruned without making any changes.

DESCRIPTION
  Models are matched to the target space by name and upserted (existing models are updated in place,
  missing ones are created). Content entries are written by their original id via PUT, which updates
  the entry if it already exists in the target space and creates it otherwise. By default, entries
  that exist in the target space but are absent from the local snapshot are left untouched — this is
  a merge/restore, not a mirror, and will never delete content.

  Pass --prune to make it a true mirror instead: after restoring, any entry belonging to a model
  present in the snapshot that isn't in the snapshot is deleted from the target space. Models that
  don't exist in the snapshot at all are never touched, even with --prune.

  Because --prune is irreversible, it asks you to type "yes" before doing anything (before any
  model or content write happens), and shows the target space's name/id and the local snapshot
  directory being restored so you can catch a stale BUILDER_PRIVATE_KEY before it's too late. Pass
  --yes to skip this prompt for scripted/CI use.

  Pass --dry-run to see exactly what would happen (models to update/create, entries to write, and
  entries that would be pruned) without making a single write, update, or delete call. --dry-run
  never prompts for confirmation, since nothing destructive happens.

  Safety guarantees:
  - Pruning is skipped entirely (with the run exiting non-zero) if any content write failed, since
    the target space wouldn't be a faithful reflection of the snapshot yet.
  - An entry created in the target space after the run started is never a candidate for pruning,
    even if it isn't in the local snapshot — this protects content created concurrently while a
    restore/prune is in flight.
  - Interrupting a run (Ctrl-C) prints how many entries were written/pruned so far before exiting,
    so you can tell whether the target space is in a partially-updated state.

  Known limitation: pruning re-downloads the entire target space's content (across all models, not
  just the ones being restored) to compute what's stale, which can be slow on very large spaces.
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
