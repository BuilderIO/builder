# Builder.io CLI

Experimental CLI for backing up, restoring, and cloning Builder.io spaces.

## Install & usage

```sh-session
$ npm install -g @builder.io/cli
$ builder <command>
```

## Commands

### `builder import -k <private key> -o <output directory>`

Downloads a full snapshot of a space (models + content) to the local filesystem, using the space's real, stable ids. Safe to re-run: writes to a staging directory first and only swaps it in once everything succeeds, so an interrupted run never corrupts a previous snapshot.

| Flag | Description |
| --- | --- |
| `-k, --key` | Private key of the space to import (or set `BUILDER_PRIVATE_KEY`) |
| `-o, --output` | Output directory (default `./builder`) |
| `-u, --include-unpublished` | Also fetch unpublished/draft content (see below) |
| `-d, --debug` | Print debug info and per-model entry counts |

By default, `import` downloads published content only. Pass `--include-unpublished` to also capture drafts: each model's content is then fetched individually (instead of one request covering every model), so a server-side issue fetching one model's drafts only falls back to published-only for that model — every other model still gets its drafts, and a warning names whichever model(s) were affected.

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

`--prune` asks for confirmation before deleting anything (unless `--yes` is passed), and is skipped entirely if any write in the run failed, so it never prunes against an incomplete restore. It always checks each model's destination content (including drafts) individually to decide what's stale, so a draft-only entry that's missing from the snapshot is still recognized as stale and deleted, just like a published one.

Within a model, entries are written one at a time in their original `createdDate` order (different models still write in parallel) — see the note on `create` below about why this matters for entries that end up being newly created in the target space.

### `builder create -k <private key> -i <input directory> -n <name>`

Creates a **new** space from a local snapshot, remapping every model/content id (and any references to them) to new ids scoped to the target organization.

| Flag | Description |
| --- | --- |
| `-k, --key` | Private key of the organization to create the space under |
| `-i, --input` | Input directory (default `./builder`) |
| `-n, --name` | Name for the new space |
| `-d, --debug` | Print debug info, including the new space's public key |

Entries within a model are created in their original `createdDate` order (models run in parallel, but entries inside a model are created one at a time). Builder decides which entry wins when several target the same URL/conditions by their position in the model's entry list, and there's no field to set that directly — recreating them in their original order is the closest a snapshot can get to reproducing the original space's priority.

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
