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

  //Ottengo longitudine e latidutide
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

  //Metodo per la searchbar
  searchWeather() {
    const city = this.searchQuery.trim();
    if (city) {
      this.getLonLat(city);
    } else {
      console.warn('Please enter a valid city name.');
    }
  }

  //Previsioni per la giornata corrente
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

  //Previsioni per i giorni a venire
  getForecast() {
    this.weatherSVC.getWeatherForecast(this.lat, this.lon).subscribe(
      (data: IForecastApiResult) => {
        this.forecastApiData = data; // Corrected variable name
        console.log(this.forecastApiData);
      },
      (error) => {
        console.log('Error fetching weather data:', error);
      }
    );
  }

  formatDate(timestamp: number) {
    this.formattedDate = new Date(timestamp * 1000).toUTCString();
    console.log(this.formattedDate);
  }

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

  formatIcon(timestamp: number) {
    this.formattedDate = new Date(timestamp * 1000).toUTCString();
    console.log(this.formattedDate);
  }

  //Default all'apertura della pagina --> TODO: usare Geolocation API
  ngOnInit() {
    this.getLonLat('Helsinki');
  }
}
