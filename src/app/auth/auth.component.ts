import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, distinctUntilChanged, fromEvent, map, startWith, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements AfterViewInit {
  isFormValid: boolean = false;

  emailControl = {
    value: '',
    isValid: false,
    isDirty: false
  };

  passwordControl = {
    value: '',
    isValid: false,
    isDirty: false
  };

  repeatPasswordControl = {
    value: '',
    isValid: false,
    isDirty: false
  };

  emailValidationSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  passValidationSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;
  repeatPassValidationSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);;

  @ViewChild('emailInput')
  emailRef!: ElementRef;
  @ViewChild('passwordInput')
  passwordRef!: ElementRef;
  @ViewChild('repeatPasswordInput')
  repeatPasswordRef!: ElementRef;

  notifier: Subject<boolean> = new Subject();

  ngAfterViewInit(): void {
    const email$ = fromEvent<any>(this.emailRef.nativeElement, 'keyup');

    const password$ = fromEvent<any>(this.passwordRef.nativeElement, 'keyup');

    const repeatPassword$ = fromEvent<any>(this.repeatPasswordRef.nativeElement, 'keyup');

    const repeatPasswordBlur$ = fromEvent<any>(this.repeatPasswordRef.nativeElement, 'blur');


    this.subscribeInput(email$, 'email');
    this.subscribeInput(password$, 'password');
    this.subscribeInput(repeatPassword$, 'repeatPassword');
    this.subscribeInput(repeatPasswordBlur$, 'repeatPassword');

    combineLatest([this.emailValidationSubject, this.passValidationSubject, this.repeatPassValidationSubject])
      .pipe(takeUntil(this.notifier))
      .subscribe(([email, password, repeatPassword]) => {
        
        if (email && password && repeatPassword) {
          this.isFormValid = email && password && repeatPassword;
        }
      });
  }

  ngOnDestroy(): void {
    this.notifier.next(true)
    this.notifier.complete()
  }

  subscribeInput(input$: Observable<any>, type: string) {
    input$.pipe(
      map(event => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      takeUntil(this.notifier)
    )
      .subscribe(
        value => {
          console.log(type);
          
          switch (type) {
            case 'email':
              this.emailControl.value = value;
              if (this.emailControl.isDirty) {
                this.validateEmail(value);
              }
              break;
            case 'password':
              this.passwordControl.value = value;
              if (this.passwordControl.isDirty === true) {
                this.validatePassword(value);
              }
              break;
            case 'repeatPassword':
              this.repeatPasswordControl.value = value;
              if (this.repeatPasswordControl.isDirty === true) {
                this.validateRepeatPassword(value);
              }
          }
        }
      );
  }

  validateEmail(value: string) {
    this.emailControl.isDirty = true;

    if (this.emailControl.isDirty) {
      const isValid = !!value.length && value.includes('@');
      this.emailValidationSubject.next(isValid);
    }
  }

  validatePassword(value: string) {
    this.passwordControl.isDirty = true;

    if (this.passwordControl.isDirty) {
      const isValid = !!value.length && value.length >= 4;
      this.passValidationSubject.next(isValid);
    }
  }

  validateRepeatPassword(value: string) {
    this.repeatPasswordControl.isDirty = true;

    if (this.repeatPasswordControl.isDirty) {
      const isValid = !!value && (this.passwordRef.nativeElement.value === value);
      this.repeatPassValidationSubject.next(isValid);
    }
  }

  submitForm() {
    alert([this.emailControl.value,
    this.passwordControl.value,
    this.repeatPasswordControl.value]);
  }
}
