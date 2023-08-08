import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { IApiResult } from './components/interfaces/api-result';
import { IWeatherDate } from './components/interfaces/weather-date';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAccessData } from './components/interfaces/access-data';
import { IRegister } from './components/interfaces/register';
import { ILogin } from './components/interfaces/login';
import { Router } from '@angular/router';
import { IForecastApiResult } from './components/interfaces/forecast-api-result';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private APIKey = 'key mandata in PVT';
  private geoAPIUrl = 'http://api.openweathermap.org/geo/1.0/direct';
  latitude!: number;
  longitude!: number;
  weatherDate!: IWeatherDate;
  constructor(private http: HttpClient, private router: Router) {}

  // Get latitude and longitude by city name
  getGeoData(
    cityName: string,
    stateCode: string,
    countryCode: string,
    limit: number
  ): Observable<any> {
    const geoAPIUrl = `${this.geoAPIUrl}?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${this.APIKey}`;
    return this.http.get<any>(geoAPIUrl);
  }

  // Get weather forecast (5 days) from openweather api (the url contains the word "forecast")
  getWeatherForecast(
    latitude: number,
    longitude: number
  ): Observable<IForecastApiResult> {
    const forecastAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric&lang=it`;
    return this.http.get<IForecastApiResult>(forecastAPIUrl);
  }

  // Get weather information for the current day, from openweather api (the url contains the word "weather")
  getTodayWeather(latitude: number, longitude: number): Observable<IApiResult> {
    const todayWAPIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric&lang=it`;
    return this.http.get<IApiResult>(todayWAPIUrl).pipe(
      map((response) => {
        return response as IApiResult;
      })
    );
  }

  // Separately fetch the date information contained in the "weather" openweather api (dt)
  getWeatherDate(
    latitude: number,
    longitude: number
  ): Observable<IWeatherDate> {
    const APIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric`;
    return this.http.get<IWeatherDate>(APIUrl);
  }

  // Get longitude and latitude by city name, using the openweather api
  getLonLatbyCity(city: string): Observable<any> {
    const geoAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.APIKey}&units=metric`;
    return this.http.get<any>(geoAPIUrl);
  }

  ///////////////////////////////////////////////////////////////////////
  // Functions and variables for authentication

  private jwtHelper: JwtHelperService = new JwtHelperService();
  userApiUrl: string = 'http://localhost:3000/';
  signUpUrl: string = this.userApiUrl + 'register';
  loginUrl: string = this.userApiUrl + 'login';

  autoLogoutTimer: any;
  private authSubject = new BehaviorSubject<null | IAccessData>(null);
  user$ = this.authSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map((user) => !!user));

  //Functions for the sign up
  signUp(data: IRegister) {
    return this.http.post<IAccessData>(this.signUpUrl, data);
  }

  //Functions for the login
  //Login
  login(data: ILogin) {
    return this.http.post<IAccessData>(this.loginUrl, data).pipe(
      tap((data) => {
        this.authSubject.next(data);
        localStorage.setItem('token', JSON.stringify(data));

        const tokenExp = this.jwtHelper.getTokenExpirationDate(
          data.token
        ) as Date;
        this.autoLogout(tokenExp);
      })
    );
  }

  //Logout
  logout() {
    this.authSubject.next(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  //AutoLogout
  autoLogout(tokenExp: Date | null) {
    if (!tokenExp) {
      return;
    }

    const tokenExpMS = tokenExp.getTime() - new Date().getTime();
    this.autoLogoutTimer = setTimeout(() => {
      this.logout();
    }, tokenExpMS);
  }
}
