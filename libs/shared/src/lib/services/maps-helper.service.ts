import { MapsAPILoader } from '@agm/core';
import { Injectable } from '@angular/core';

@Injectable()
export class MapsHelper {
  constructor(private readonly mapsAPILoader: MapsAPILoader) {}

  getCoordinatesForAddress(
    address: string
  ): Promise<{ latitude: number; longitude: number }> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status.toString() === 'OK') {
          const result = results[0],
            coordinates = {
              latitude:
                Math.round(result.geometry.location.lat() * 10000) / 10000,
              longitude:
                Math.round(result.geometry.location.lng() * 10000) / 10000
            };
          resolve(coordinates);
        } else {
          reject();
        }
      });
    });
  }

  loadMaps(): Promise<void> {
    return this.mapsAPILoader.load();
  }
}
