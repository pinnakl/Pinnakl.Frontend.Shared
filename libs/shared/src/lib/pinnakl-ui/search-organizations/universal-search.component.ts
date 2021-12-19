import { Component } from '@angular/core';
import { debounce } from 'lodash';

import { UniversalSearch, UniversalSearchFromAPI } from '../..';
import { UniveralSearchService } from '../../services/universal-search.service';

@Component({
  selector: 'app-universal-search',
  templateUrl: './universal-search.component.html',
  styleUrls: ['./universal-search.component.scss'],
  providers: [UniveralSearchService]
})
export class UniversalSearchComponent {

  constructor(private readonly univeralSearchService: UniveralSearchService) { }

  searchResults: UniversalSearch[] = [];
  artifactType = '';
  searchValue = '';
  openSearchResultsBlock = false;
  colors = ['#4E13CA', '#8652F5', '#4068FF', '#31C8FF', '#779CDC', '#F04400', '#FF28AE', '#FFC105', '#00A27C', '#0CF1A7'];
  loadDebounceData = debounce(() => {
    this.univeralSearchService.getSearchOrganization<UniversalSearchFromAPI>(this.searchValue, this.artifactType).then((data) => {
      this.searchResults = data.map(el => {
        return {
          ArtifactType: el.ArtifactType,
          Result: JSON.parse(el.Result),
          color: this.getRandomColor()
        };
      });
    });
  }, 300);

  searchOrganizations(value: string): void {
    this.searchValue = value;
    if (value.length >= 3) {
      this.openSearchResultsBlock = true;
      this.loadDebounceData();
    } else {
      this.openSearchResultsBlock = false;
      this.searchResults = [];
      this.artifactType = '';
    }
  }


  changeArtifactType(type: string): void {
    this.artifactType = type;
    this.searchOrganizations(this.searchValue);
  }

  getTitle(el: UniversalSearch, searchValue?: string): string {
    let title = '';
    switch (el.ArtifactType) {
      case 'Organization':
        title = el.Result['OrganizationName'];
        break;
      case 'Contact':
        title = el.Result['Name'];
        break;
      case 'Deal':
        title = el.Result['DealName'];
        break;
    }
    // finds search word if searchValue !== undefined
    title = searchValue ? title.toLocaleLowerCase().split(' ').find(str => str.includes(searchValue.toLocaleLowerCase())) : title;
    return title;
  }


  getCurrentIconByType(el: UniversalSearch): string {
    switch (el.ArtifactType) {
      case 'Organization':
        return 'icon-pinnakl-organization-icon';
      case 'Contact':
        return 'icon-pinnakl-investor-count-icon';
      case 'Deal':
        return 'icon-pinnakl-deal-icon';
      default:
        return '';
    }
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  linkToEntity(el: UniversalSearch, linkPage = null): string {
    const type = !linkPage ? el.ArtifactType : linkPage;
    switch (type) {
      case 'Organization':
      case 'Deal':
        // case 'Contact':
        return `/crm/crm-home/investor-details-home;id=${el.Result['OrganizationId']}`;
      // TODO uncomment when there will be a contact card
      case 'Contact':
        return `/crm/crm-home/contact-details-home;id=${el.Result['ContactId']}`;
      default:
        return '';
    }
  }

  addAlpha(color: string, opacity: number = 0.2): string {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }
}
