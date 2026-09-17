# Builder.io CLI

Experimental CLI for backing up, restoring, and cloning Builder.io spaces.

## Install & usage

```sh-session
$ npm install -g @builder.io/cli
$ builder <command>
```

## Commands

### `builder import -k <private key> -o <output directory>`

Downloads a full snapshot of a space (models + content, including unpublished/draft entries) to the local filesystem, using the space's real, stable ids. Safe to re-run: writes to a staging directory first and only swaps it in once everything succeeds, so an interrupted run never corrupts a previous snapshot.

| Flag | Description |
| --- | --- |
| `-k, --key` | Private key of the space to import (or set `BUILDER_PRIVATE_KEY`) |
| `-o, --output` | Output directory (default `./builder`) |
| `-d, --debug` | Print debug info and per-model entry counts |

The output directory is fully replaced on each successful run, so only point it at an empty directory or a prior snapshot from this command.

### `builder overwrite -k <private key> -i <input directory>`

Restores a local snapshot into the **same, existing** space it was taken from (by id) — this is the counterpart to `import` for backups. Models are upserted by name; content entries are upserted by their original id. Upserting means a full replace: any model or entry that already exists in the target is overwritten with the snapshot's version, discarding changes made since the snapshot was taken. By default nothing is deleted — models and entries that exist in the target but aren't in the snapshot are left alone; use `--prune` to also remove those.

| Flag | Description |
| --- | --- |
| `-k, --key` | Private key of the space to restore into |
| `-i, --input` | Input directory (default `./builder`) |
| `-p, --prune` | Also delete entries in the target space that are missing from the snapshot (destructive) |
| `-y, --yes` | Skip the `--prune` confirmation prompt (for CI/scripts) |
| `--dry-run` | Show what would change without writing anything |
| `-d, --debug` | Print debug info |

`--prune` asks for confirmation before deleting anything (unless `--yes` is passed), and is skipped entirely if any write in the run failed, so it never prunes against an incomplete restore.

### `builder create -k <private key> -i <input directory> -n <name>`

Creates a **new** space from a local snapshot, remapping every model/content id (and any references to them) to new ids scoped to the target organization.

| Flag | Description |
| --- | --- |
| `-k, --key` | Private key of the organization to create the space under |
| `-i, --input` | Input directory (default `./builder`) |
| `-n, --name` | Name for the new space |
| `-d, --debug` | Print debug info, including the new space's public key |

### `builder integrate [options]`

Wires Builder into an existing Next.js project by adding a catch-all route for a given model.

| Flag | Description |
| --- | --- |
| `-s, --stack` | Framework to integrate with (default `nextjs`) |
| `-m, --model` | Model to integrate |
| `-a, --apiKey` | Your space's public API key |
| `-p, --pathPrefix` | URL prefix to nest generated routes under (default none) |
| `-d, --debug` | Print debug info |

## Developing

| Script | Description |
| --- | --- |
| `npm run dev` | Rebuilds on file change |
| `npm run build` | Cleans and builds to `./dist` |
| `npm run test` | Builds and runs the test suite |
| `npm run bundle` | Builds native executables into `./exec` |
