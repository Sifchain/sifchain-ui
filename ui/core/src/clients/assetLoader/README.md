### Generated Assets

All assets for both Sifchain and Ethereum networks are generated from pulling the token registry for a given environment.

Asset image URLs and some other data (like special messages and UI flags) are set in ./assetMetadata. 

Any asset in the tokenregistry not present in assetMetadata will *not* be loaded into the application. This is to stop assets that have been added to API but aren't yet ready for primetime from sneaking into the asset list.

Update assets via `yarn generate:assets:devnet`, or any environment. See the package.json for the available commands.

Generated assets are written to `./src/generated/assets/`, with files `assets-{env}.native.ts` and `assets-{env}.ethereum.ts`

All non-Sifchain and non-Ethereum assets are currently dynamically generated at runtime from the native assets. They are just clones of the Sif assets so it seemed right to continue this practice.


