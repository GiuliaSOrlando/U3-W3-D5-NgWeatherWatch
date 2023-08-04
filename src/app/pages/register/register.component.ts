import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IRegister } from 'src/app/components/interfaces/register';
import { WeatherService } from 'src/app/weather.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formData: IRegister = {
    name: '',
    surname: '',
    email: '',
    password: '',
  };

  constructor(private weatherSVC: WeatherService, private router: Router) {}

  signup() {
    this.weatherSVC.signUp(this.formData).subscribe((res) => {
      this.router.navigate(['register']);
    });
  }
}
