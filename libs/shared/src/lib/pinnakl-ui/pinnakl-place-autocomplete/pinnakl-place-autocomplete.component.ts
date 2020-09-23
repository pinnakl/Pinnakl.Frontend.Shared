import { MapsAPILoader } from '@agm/core';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';
import { Place } from './place.model';

@Component({
  selector: 'pinnakl-place-autocomplete',
  template: `
    <input
      type="text"
      (change)="textChanged($event)"
      class="pnkl-input"
      #input
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklPlaceAutocompleteComponent),
      multi: true
    }
  ]
})
export class PinnaklPlaceAutocompleteComponent
  implements ControlValueAccessor, OnInit {
  @Input() placeType: string;
  @Input() sendPlaceDetails = false;
  @Input() suggestionType: string;
  @Output() placeDetailsReceived = new EventEmitter<Place>();

  @ViewChild('input', { static: true }) private inputElementRef: ElementRef;

  private inputElement: HTMLInputElement;
  private placeTypeValid: boolean;
  private suggestionTypeValid = false;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.inputElement = this.inputElementRef.nativeElement;
    this.placeType = this.placeType ? this.placeType.toLowerCase() : '';
    this.placeTypeValid = _.includes(
      ['city', 'country', 'postalcode', 'state', 'street'],
      this.placeType
    );
    this.suggestionTypeValid = _.includes(
      ['(cities)', '(regions)', 'address', 'establishment', 'geocode'],
      this.suggestionType
    );
    this.initializeAutocomplete();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}

  textChanged(event: Event): void {
    const value = (<HTMLInputElement>event.target).value;
    this.propagateChange(value);
  }

  writeValue(value: string): void {
    this.inputElement.value = value;
  }

  private getAddressComponent(
    addressComponents: google.maps.GeocoderAddressComponent[],
    componentType: string
  ): string {
    const component = addressComponents.find(addressComponent =>
      _.includes(addressComponent.types, componentType)
    );
    return component ? component.long_name : null;
  }

  private getCity(
    addressComponents: google.maps.GeocoderAddressComponent[]
  ): string {
    let city = this.getAddressComponent(addressComponents, 'locality');
    if (!city) {
      city = this.getAddressComponent(addressComponents, 'postal_town');
    }
    return city;
  }

  private getStreet(place: google.maps.places.PlaceResult): string {
    const route = this.getAddressComponent(place.address_components, 'route'),
      streetNumber = this.getAddressComponent(
        place.address_components,
        'street_number'
      ),
      streetAddress = !route
        ? null
        : streetNumber
        ? `${streetNumber} ${route}`
        : route;
    return streetAddress ? streetAddress : null;
  }

  private initializeAutocomplete(): void {
    this.mapsAPILoader.load().then(() => {
      let autocomplete: google.maps.places.Autocomplete;
      autocomplete = this.suggestionTypeValid
        ? new google.maps.places.Autocomplete(this.inputElement, {
            types: [this.suggestionType]
          })
        : new google.maps.places.Autocomplete(this.inputElement);
      autocomplete.addListener('place_changed', () =>
        this.ngZone.run(() => {
          const place = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.placeChanged(place);
        })
      );
    });
  }

  private placeChanged(place: google.maps.places.PlaceResult): void {
    let city = '',
      country = '',
      postalCode = '',
      state = '',
      street = '';
    if (!this.placeTypeValid) {
      this.setComponentValue(`${place.name}, ${place.formatted_address}`);
    } else {
      switch (this.placeType) {
        case 'city':
          city = this.getCity(place.address_components);
          this.setComponentValue(city);
          break;
        case 'country':
          country = this.getAddressComponent(
            place.address_components,
            'country'
          );
          this.setComponentValue(country);
          break;
        case 'postalcode':
          postalCode = this.getAddressComponent(
            place.address_components,
            'postal_code'
          );
          this.setComponentValue(postalCode);
          break;
        case 'state':
          state = this.getAddressComponent(
            place.address_components,
            'administrative_area_level_1'
          );
          this.setComponentValue(state);
          break;
        case 'street': {
          street = this.getStreet(place);
          this.setComponentValue(street);
          break;
        }
      }
    }
    if (this.sendPlaceDetails) {
      this.sendPlaceComponents(city, country, place, postalCode, state, street);
    }
  }

  private propagateChange(placeComponent: string): void {}

  private sendPlaceComponents(
    city: string,
    country: string,
    place: google.maps.places.PlaceResult,
    postalCode: string,
    state: string,
    street: string
  ): void {
    const addressComponents = place.address_components;
    city = city !== '' ? city : this.getCity(addressComponents);
    country =
      country !== ''
        ? country
        : this.getAddressComponent(addressComponents, 'country');
    postalCode =
      postalCode !== ''
        ? postalCode
        : this.getAddressComponent(addressComponents, 'postal_code');
    state =
      state !== ''
        ? state
        : this.getAddressComponent(
            addressComponents,
            'administrative_area_level_1'
          );
    street = street !== '' ? street : this.getStreet(place);
    this.placeDetailsReceived.emit(
      new Place(city, country, postalCode, state, street)
    );
  }

  private setComponentValue(value: string): void {
    this.propagateChange(value);
    this.inputElement.value = value;
  }
}
