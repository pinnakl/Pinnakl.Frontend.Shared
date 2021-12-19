export const getMultiplierByAssetType = assetType => {
  switch (assetType.toLowerCase()) {
    case 'option':
      return 100;
    case 'bond':
      return 0.01;
    default:
      return 1;
  }
};
