import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ILogin } from 'src/app/components/interfaces/login';
import { WeatherService } from 'src/app/weather.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  formData: ILogin = {
    email: '',
    password: '',
  };

  constructor(private weatherSVC: WeatherService, private router: Router) {}

  login() {
    this.weatherSVC.login(this.formData).subscribe((data) => {
      this.router.navigate(['']);
      alert(`Login avvenuto con successo!`);
    });
  }
}
