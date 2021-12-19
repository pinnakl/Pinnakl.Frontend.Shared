import { Injectable } from '@angular/core';

import { filter, find, maxBy, min, minBy, sortBy } from 'lodash';

@Injectable()
export class PnklTreeMapService {
  // This method should not be bind with 'this' object of its component,
  // it is deliberately made to use 'this' object of high charts.
  dataLabelFormatter(): string {
    try {
      let point = this['point'],
        shape = point['shapeArgs'],
        height = shape['height'],
        width = shape['width'],
        fontSize = getFontSIze(height, width),
        name = point['name'],
        value = point['value'];
      let formatter = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
      value = formatter.format(value);

      if (point['node']['level'] === 1 && point['node']['childrenTotal'] > 0) {
        if (fontSize < 8 || width < name.length * 8 || height < 40) {
          return '';
        }
        return `<div style="background: black;width: ${width -
          2}px; color: white;text-align:center;">${name}</div>`;
      }
      if (fontSize > 20 && width > 100) {
        return `<div style="text-align: center">
                  <div style="
                    word-break: inherit;
                    height: max-content;
                    width: ${width}px;font-size: ${fontSize - fontSize * 0.40}px;
                    padding: 0 ${width / 5}px;">${name}
                  </div>
                  <div style="font-size: ${fontSize - fontSize * 0.50}px;">${value}%</div>
                </div>`;
      } else {
        if (fontSize > 12) {
          return `<div style="text-align: center">
                  <div style="word-break: inherit;
                    height: max-content;
                    width: ${width}px;
                    font-size: ${fontSize - fontSize * 0.20}px">${name}
                  </div>
                  <div style="font-size: ${fontSize - fontSize * 0.15}px;">${value}%</div>
                </div>`;
        }
      }
      if (fontSize > 6 && width > 35) {
        // return name;
        return `<div style="text-align: center">
                  <div style="word-break: inherit;
                    height: max-content;
                    width: ${width}px;
                    font-size: ${fontSize * 0.8}px">${name}
                  </div>
                </div>`;
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  getFormattedTreeMapData(
    categoryName: string,
    categoryValuesField: string,
    dataField: string,
    dataLabelField: string,
    isNestedTreeMap: boolean,
    data: any[]
  ): any[] {
    let { max, min } = this.getMaxAndMinDataValues(
      categoryValuesField,
      dataField,
      isNestedTreeMap,
      data
    );
    let formattedData: {
      id?: string;
      name: string;
      parent?: string;
      value?: number;
      color?: string;
    }[] = [];
    if (isNestedTreeMap) {
      data.forEach(item => {
        formattedData.push({
          id: (item[categoryName] as string).toUpperCase(),
          name: (item[categoryName] as string).toUpperCase()
        });

        item[categoryValuesField].forEach(dataRow => {
          formattedData.push({
            name: (dataRow[dataLabelField] as string).toUpperCase(),
            parent: (item[categoryName] as string).toUpperCase(),
            value: Math.abs(dataRow[dataField]),
            color: this.getColorCode(dataRow[dataField], max, min)
          });
        });
      });
    } else {
      data.forEach(item => {
        formattedData.push({
          name: (item[dataLabelField] as string).toUpperCase(),
          value: Math.abs(item[dataField]),
          color: this.getColorCode(item[dataField], max, min)
        });
      });
    }
    return formattedData;
  }

  getColorCode(value: number, max: number, min: number): string {
    let colorsForPositiveValues = ['#64ec58', '#0ad427', '#00a235'];
    let colorsForNegativeValues = ['#FF7B50', '#FF3A2F', '#C80A0A'];
    let minPositive = min > 0 ? min : 0,
      maxNegative = max < 0 ? max : 0;

    if (value > 0) {
      return colorsForPositiveValues[
        Math.ceil(((value - minPositive) / (max - minPositive)) * 3) - 1
      ];
    }
    if (value < 0) {
      return colorsForNegativeValues[
        Math.ceil(((value - maxNegative) / (min - maxNegative)) * 3) - 1
      ];
    }
    return '#454D55';
  }

  getMaxAndMinDataValues(
    categoryValuesField: string,
    dataField: string,
    isNestedTreeMap: boolean,
    data: any[]
  ): { max: number; min: number } {
    let max = 0,
      min = 0;
    if (isNestedTreeMap) {
      data.forEach(category => {
        let maxCategoryValue = maxBy(category[categoryValuesField], dataField)[
          dataField
        ];
        let minCategoryValue = minBy(category[categoryValuesField], dataField)[
          dataField
        ];
        max = max > maxCategoryValue ? max : maxCategoryValue;
        min = min < minCategoryValue ? min : minCategoryValue;
      });
    } else {
      max = maxBy(data, dataField)[dataField];
      min = minBy(data, dataField)[dataField];
    }
    return { max, min };
  }
}

export function getHTMLRow(
  lebels: string[],
  rowData: any,
  color: string
): string {
  let htmlRowStart = '<tr>';
  let htmlString = '';
  if (color) {
    htmlRowStart = `<tr style="background-color:${color}; color: white"}>`;
  }
  lebels.forEach(label => {
    if (label === 'totalPnl') {
      let textColor = '';
      if (!color) {
        textColor = rowData[label] > 0 ? 'green' : 'red';
      }
      htmlString = `${htmlString}<td style="color:${textColor};text-align: right"> ${getFormattedTooltipNumericValues(
        rowData[label],
        label
      )} </td>`;
    } else if (!isNaN(rowData[label])) {
      htmlString = `${htmlString}<td style="text-align: right"> ${getFormattedTooltipNumericValues(
        rowData[label],
        label
      )} </td>`;
    } else {
      htmlString = `${htmlString}<td > ${rowData[label]} </td>`;
    }
  });

  return `${htmlRowStart}${htmlString}</tr>`;
}

export function getFormattedTooltipNumericValues(
  value: number,
  label: string
): string {
  let formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 2
  });
  if (value === 0 && label === 'price') {
    return '-';
  }

  if (label === 'totalPnl') {
    return value === 0 ? '-' : `${formatter.format(value)}%`;
  }
  return `${formatter.format(value)}`;
}

export function getHTMLTableHeader(labels: string[]): string {
  return `<thead><tr>${labels.reduce(
    (htmlString, label) => `${htmlString}<th scope="col">${label}</th>`,
    ''
  )}</tr></thead>`;
}

export function getCategoryAndCurrentPoint(
  parentComponent: any,
  parent: string,
  name: string
): { categoryData: any; currentPoint: any } {
  let categoryData = find(
      parentComponent._data,
      x =>
        x[parentComponent.categoryName].toLowerCase() === parent.toLowerCase()
    )[parentComponent.categoryValuesField],
    currentPoint = find(
      categoryData,
      x =>
        x[parentComponent.dataLabelField].toLowerCase() === name.toLowerCase()
    );
  return { categoryData, currentPoint };
}

function getFontSIze(height: number, width: number): number {
  return Math.floor(
    min([height, width]) / 4 > 50 ? 50 : min([height, width]) / 4
  );
}

export function tooltipFormatter(parentComponent: any): any {
  return function(): string {
    if (!this['point']) {
      return '';
    }
    let name: string = this['point']['name'];
    if (parentComponent.isNestedTreeMap) {
      if (!this['point']['parent']) {
        return '';
      }
      let { categoryData, currentPoint } = getCategoryAndCurrentPoint(
        parentComponent,
        this['point']['parent'],
        name
      );
      let sortedFilteredItems = filter(
        sortBy(categoryData, x => -x[parentComponent.dataField]),
        x =>
          (x[parentComponent.dataLabelField] as string).toLowerCase() !==
          name.toLowerCase()
      );
      return `<div style="border: 1px solid black">
                            <h3 class="my-2 text-align-center">${
                              this['point']['parent']
                            }</h3>
                            ${getHTMLTable(
                              getHTMLTableHeader(
                                parentComponent.tooltipHeaderFields
                              ),
                              `${getHTMLRow(
                                parentComponent.tooltipDataFields,
                                currentPoint,
                                this['color']
                              )}
                            ${sortedFilteredItems.reduce(
                              (htmlString, currentValue) => {
                                return (
                                  htmlString +
                                  getHTMLRow(
                                    parentComponent.tooltipDataFields,
                                    currentValue,
                                    ''
                                  )
                                );
                              },
                              ''
                            )}`
                            )}
                          </div>`;
    }
    let currentPoint = find(
      parentComponent._data,
      x =>
        x[parentComponent.dataLabelField].toLowerCase() === name.toLowerCase()
    );
    return getHTMLTable(
      getHTMLTableHeader(parentComponent.tooltipHeaderFields.slice(1)),
      getHTMLRow(parentComponent.tooltipDataFields.slice(1), currentPoint, '')
    );
  };
}

export function getHTMLTable(headerHtml: string, bodyHTML: string): string {
  return `<table class="table table-striped"> ${headerHtml}<tbody>${bodyHTML}</tbody></table>`;
}
