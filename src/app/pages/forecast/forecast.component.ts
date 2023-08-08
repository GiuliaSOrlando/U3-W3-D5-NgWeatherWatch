import { Component } from '@angular/core';
import { IApiResult } from 'src/app/components/interfaces/api-result';
import { IForecastApiResult } from 'src/app/components/interfaces/forecast-api-result';
import { IWeatherDate } from 'src/app/components/interfaces/weather-date';
import { WeatherService } from 'src/app/weather.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss'],
})
export class ForecastComponent {
  searchQuery: string = '';
  searchResults: any[] = [];
  lat!: number;
  lon!: number;
  apiData!: IApiResult;
  forecastApiData!: IForecastApiResult;
  weatherDate: IWeatherDate | undefined;
  formattedDate: string | undefined;

  constructor(private weatherSVC: WeatherService) {}

  //Get longitude and latitude using openweather api
  getLonLat(city: string): void {
    this.weatherSVC.getLonLatbyCity(city).subscribe(
      (data) => {
        this.apiData = data;
        this.lat = data.coord.lat;
        this.lon = data.coord.lon;
        console.log(data);
        this.getWeather();
        this.getWeatherDate();
        this.getForecast();
      },
      (error) => {
        console.error('Error fetching weather data:', error);
      }
    );
  }

  //Method for the searchbar
  searchWeather() {
    const city = this.searchQuery.trim();
    if (city) {
      this.getLonLat(city);
    } else {
      console.warn('Please enter a valid city name.');
    }
  }

  //Forecast for the current day
  getWeather() {
    this.weatherSVC.getTodayWeather(this.lat, this.lon).subscribe(
      (data) => {
        this.apiData = data;
        console.log(this.apiData);
      },
      (error) => {
        console.log('Error fetching weather data:', error);
      }
    );
  }

  //Forecast for the next five days
  getForecast() {
    this.weatherSVC.getWeatherForecast(this.lat, this.lon).subscribe(
      (data: IForecastApiResult) => {
        this.forecastApiData = data;
        console.log(this.forecastApiData);
      },
      (error) => {
        console.log('Error fetching weather data:', error);
      }
    );
  }

  // Date formatting (dt)
  formatDate(timestamp: number) {
    this.formattedDate = new Date(timestamp * 1000).toUTCString();
    console.log(this.formattedDate);
  }

  //Date fetching (dt)
  getWeatherDate() {
    this.weatherSVC.getWeatherDate(this.lat, this.lon).subscribe(
      (data) => {
        this.weatherDate = data;
        this.formatDate(this.weatherDate.dt);
      },
      (error) => {
        console.error('Error fetching weather date:', error);
      }
    );
  }

  //Weather info using geolocation api
  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      let navigatorlatitude = position.coords.latitude;
      let navigatorlongitude = position.coords.longitude;

      this.weatherSVC
        .getTodayWeather(navigatorlatitude, navigatorlongitude)
        .subscribe((data) => {
          this.apiData = data;
        });
    });
  }
}
