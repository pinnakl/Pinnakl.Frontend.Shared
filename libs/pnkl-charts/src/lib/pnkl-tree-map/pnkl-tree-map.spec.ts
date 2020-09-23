import {
  getHTMLTableHeader,
  PnklTreeMapService
} from './pnkl-tree-map.service';

describe('pnkl-tree-map', () => {
  let pnklTreeMapService: PnklTreeMapService;
  let categoryValuesField = 'persons';
  let categoryName = 'familyName';
  let dataField = 'repeatedCount';
  let dataLabelField = 'name';
  let isNestedTreeMap = true;
  const colorsForPositiveValues = ['#64ec58', '#0ad427', '#00a235'];
  const colorsForNegativeValues = ['#FF7B50', '#FF3A2F', '#C80A0A'];

  let dataWithCategories = [
    {
      familyName: 'Stark',
      persons: [
        { name: 'Robb', famousLines: 'King In the North', repeatedCount: 20 },
        { name: 'Arya', famousLines: 'A girl has No name', repeatedCount: 15 },
        { name: 'Jon', famousLines: 'You know nothing', repeatedCount: 10 }
      ]
    },
    {
      familyName: 'Lenister',
      persons: [
        {
          name: 'Tyrion',
          famousLines: 'Lenisters always pays there debts',
          repeatedCount: 5
        },
        { name: 'Jaime', famousLines: 'Burn them all', repeatedCount: -5 },
        { name: 'Tywin', famousLines: 'My Family Legacy', repeatedCount: -2 }
      ]
    }
  ];

  let dataWithoutCategories = [
    { name: 'Robb', famousLines: 'King In the North', repeatedCount: 20 },
    { name: 'Arya', famousLines: 'A girl has No name', repeatedCount: 15 },
    { name: 'Jon', famousLines: 'You know nothing', repeatedCount: 10 },
    {
      name: 'Tyrion',
      famousLines: 'Lenisters always pays there debts',
      repeatedCount: 5
    },
    { name: 'Jaime', famousLines: 'Burn them all', repeatedCount: -5 },
    { name: 'Tywin', famousLines: 'My Family Legacy', repeatedCount: -2 }
  ];
  beforeEach(() => {
    pnklTreeMapService = new PnklTreeMapService();
  });

  describe('getMaxAndMinDataValues', () => {
    it('should give maximum and minimum values when nested tree map data is present', () => {
      isNestedTreeMap = true;
      let maxMinObject = pnklTreeMapService.getMaxAndMinDataValues(
        categoryValuesField,
        dataField,
        isNestedTreeMap,
        dataWithCategories
      );
      expect(maxMinObject).toEqual({ max: 20, min: -5 });
    });

    it('should give maximum and minimum values when nested tree map is false', () => {
      isNestedTreeMap = false;
      let maxMinObject = pnklTreeMapService.getMaxAndMinDataValues(
        categoryValuesField,
        dataField,
        isNestedTreeMap,
        dataWithoutCategories
      );
      expect(maxMinObject).toEqual({ max: 20, min: -5 });
    });
  });

  describe('getColorCode', () => {
    it('should give appropriate color based on positive value', () => {
      let colorCode = pnklTreeMapService.getColorCode(16, 20, -5);
      expect(colorCode).toEqual(colorsForPositiveValues[2]);

      colorCode = pnklTreeMapService.getColorCode(11, 20, -5);
      expect(colorCode).toEqual(colorsForPositiveValues[1]);

      colorCode = pnklTreeMapService.getColorCode(6, 20, -5);
      expect(colorCode).toEqual(colorsForPositiveValues[0]);

      colorCode = pnklTreeMapService.getColorCode(16, 20, 11);
      expect(colorCode).toEqual(colorsForPositiveValues[1]);
    });
    it('should give appropriate color based on negative value', () => {
      let colorCode = pnklTreeMapService.getColorCode(-4, 20, -5);
      expect(colorCode).toEqual(colorsForNegativeValues[2]);

      colorCode = pnklTreeMapService.getColorCode(-4, 20, -10);
      expect(colorCode).toEqual(colorsForNegativeValues[1]);

      colorCode = pnklTreeMapService.getColorCode(-1, 20, -5);
      expect(colorCode).toEqual(colorsForNegativeValues[0]);

      colorCode = pnklTreeMapService.getColorCode(-7, -1, -15);
      expect(colorCode).toEqual(colorsForNegativeValues[1]);
    });
  });

  describe('getFormattedData', () => {
    it('should give formatted data for nested tree', () => {
      let formattedDataWithCategories = [
        { id: 'STARK', name: 'STARK' },
        {
          name: 'ROBB',
          parent: 'STARK',
          value: 20,
          color: pnklTreeMapService.getColorCode(20, 20, -5)
        },
        {
          name: 'ARYA',
          parent: 'STARK',
          value: 15,
          color: pnklTreeMapService.getColorCode(15, 20, -5)
        },
        {
          name: 'JON',
          parent: 'STARK',
          value: 10,
          color: pnklTreeMapService.getColorCode(10, 20, -5)
        },
        { id: 'LENISTER', name: 'LENISTER' },
        {
          name: 'TYRION',
          parent: 'LENISTER',
          value: 5,
          color: pnklTreeMapService.getColorCode(5, 20, -5)
        },
        {
          name: 'JAIME',
          parent: 'LENISTER',
          value: 5,
          color: pnklTreeMapService.getColorCode(-5, 20, -5)
        },
        {
          name: 'TYWIN',
          parent: 'LENISTER',
          value: 2,
          color: pnklTreeMapService.getColorCode(-2, 20, -5)
        }
      ];
      let formattedData = pnklTreeMapService.getFormattedTreeMapData(
        categoryName,
        categoryValuesField,
        dataField,
        dataLabelField,
        true,
        dataWithCategories
      );
      expect(formattedData).toEqual(formattedDataWithCategories);
    });
    it('should give formatted data for flat data structure', () => {
      let formattedDataWithoutCategories = [
        {
          name: 'ROBB',
          value: 20,
          color: pnklTreeMapService.getColorCode(20, 20, -5)
        },
        {
          name: 'ARYA',
          value: 15,
          color: pnklTreeMapService.getColorCode(15, 20, -5)
        },
        {
          name: 'JON',
          value: 10,
          color: pnklTreeMapService.getColorCode(10, 20, -5)
        },
        {
          name: 'TYRION',
          value: 5,
          color: pnklTreeMapService.getColorCode(5, 20, -5)
        },
        {
          name: 'JAIME',
          value: 5,
          color: pnklTreeMapService.getColorCode(-5, 20, -5)
        },
        {
          name: 'TYWIN',
          value: 2,
          color: pnklTreeMapService.getColorCode(-2, 20, -5)
        }
      ];
      let formattedData = pnklTreeMapService.getFormattedTreeMapData(
        categoryName,
        categoryValuesField,
        dataField,
        dataLabelField,
        false,
        dataWithoutCategories
      );
      expect(formattedData).toEqual(formattedDataWithoutCategories);
    });
  });

  describe('getHTMLTableHeader', () => {
    it('should give correct header HTML', () => {
      let headerHTML = `<thead><tr><th scope="col">Marks</th><th scope="col">Percentage</th></tr></thead>`;
      expect(getHTMLTableHeader(['Marks', 'Percentage'])).toEqual(headerHTML);
    });
  });
});
