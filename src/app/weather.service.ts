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
  private APIKey = '0af35db9fbe04b2536d369731b7a09e2';
  private geoAPIUrl = 'http://api.openweathermap.org/geo/1.0/direct';
  latitude!: number;
  longitude!: number;
  weatherDate!: IWeatherDate;
  constructor(private http: HttpClient, private router: Router) {}

  getGeoData(
    cityName: string,
    stateCode: string,
    countryCode: string,
    limit: number
  ): Observable<any> {
    const geoAPIUrl = `${this.geoAPIUrl}?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${this.APIKey}`;
    return this.http.get<any>(geoAPIUrl);
  }

  getWeatherForecast(
    latitude: number,
    longitude: number
  ): Observable<IForecastApiResult> {
    const forecastAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric&lang=it`;
    return this.http.get<IForecastApiResult>(forecastAPIUrl);
  }

  getTodayWeather(latitude: number, longitude: number): Observable<IApiResult> {
    const todayWAPIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric&lang=it`;
    return this.http.get<IApiResult>(todayWAPIUrl).pipe(
      map((response) => {
        return response as IApiResult;
      })
    );
  }

  getWeatherDate(
    latitude: number,
    longitude: number
  ): Observable<IWeatherDate> {
    const APIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.APIKey}&units=metric`;
    return this.http.get<IWeatherDate>(APIUrl);
  }

  getLonLatbyCity(city: string): Observable<any> {
    const geoAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.APIKey}&units=metric`;
    return this.http.get<any>(geoAPIUrl);
  }

  private jwtHelper: JwtHelperService = new JwtHelperService();
  userApiUrl: string = 'http://localhost:3000/';
  signUpUrl: string = this.userApiUrl + 'register';
  loginUrl: string = this.userApiUrl + 'login';

  autoLogoutTimer: any;
  private authSubject = new BehaviorSubject<null | IAccessData>(null);
  user$ = this.authSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map((user) => !!user));

  //Funzioni per la registrazione
  signUp(data: IRegister) {
    return this.http.post<IAccessData>(this.signUpUrl, data);
  }

  //Funzioni per il login
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
