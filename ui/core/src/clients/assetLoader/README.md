### Generated Assets

All assets for both Sifchain and Ethereum networks are generated from pulling the token registry for a given environment.

Asset image URLs and some other data (like special messages and UI flags) are set in ./assetMetadata. 

Any asset in the tokenregistry not present in assetMetadata will *not* be loaded into the application. This is to stop assets that have been added to API but aren't yet ready for primetime from sneaking into the asset list.

Update assets via `yarn generate:assets:devnet`, or any environment. See the package.json for the available commands.

Generated assets are written to `./src/generated/assets/`, with files `assets-{env}.native.ts` and `assets-{env}.ethereum.ts`

All non-Sifchain and non-Ethereum assets are currently dynamically generated at runtime from the native assets. They are just clones of the Sif assets so it seemed right to continue this practice.

### Adding a new asset

1. Ensure chain / network is added. Go to Network enum and then add the Chain object in clients/chains, then in Chain service.
2. Ensure asset image is added to ./assetMetadata (this will allow asset to be added from the whitelist)
3. If the asset is ethereum-compatible, add its contract address to ./assetAddresses.

### Decommissioning an asset

Just add decommissioned: true to ./assetMetadata.


