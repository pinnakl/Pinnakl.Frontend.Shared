import { CustomAttributeFeature, CustomAttributeMappingTable } from './../custom-attributes-feature.model';

export class CustomAttributeFromApi {
  constructor(
    public id: string, 
    public name: string, 
    public type: string, 
    public feature: CustomAttributeFeature, 
    public mappingTable: CustomAttributeMappingTable
  ) {}
}
