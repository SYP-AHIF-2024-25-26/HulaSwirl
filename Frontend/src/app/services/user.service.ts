import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ErrorService} from './error.service';
import {environment} from '../../environments/environment';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly errorService = inject(ErrorService);

  jwt = signal<string | null>(this.getTokenFromStorage());
  username = signal<string | null>(this.getUsernameFromStorage());
  isAdminFlag = signal<boolean>(this.getIsAdminFlagFromStorage()!);


  public getTokenFromStorage(): string | null {
    return localStorage.getItem('jwt');
  }

  private getUsernameFromStorage(): string | null {
    return localStorage.getItem('username');
  }

  private getIsAdminFlagFromStorage(): boolean  {
    return localStorage.getItem("isAdminFlag")==="true";
  }

  private setToken(token: string | null, username: string | null, isAdminFlag: boolean | null): void {
    if (token) {
      localStorage.setItem('jwt', token);
      this.jwt.set(token);
    }

    if (username) {
      localStorage.setItem('username', username);
      this.username.set(username);
    }
    console.log(isAdminFlag)
    if (isAdminFlag !== null) {
      localStorage.setItem('isAdminFlag', String(isAdminFlag));
      this.isAdminFlag.set(isAdminFlag);
    }
  }
  public setLocalStorage(): void {
    this.jwt.set(localStorage.getItem('jwt'));
    this.username.set(localStorage.getItem('username'));
    this.isAdminFlag.set(Boolean(localStorage.getItem('isAdminFlag')));
  }

  private clearToken(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdminFlag')
    this.jwt.set(null);
    this.isAdminFlag.set(false);
    this.username.set(null);
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const todo='registering'
    const url = `${environment.apiUrl}/users`;
    const payload: RegisterRequest = { username, email, password };
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
      const isAdmin = await this.checkAdmin(res.token);
      this.setToken(res.token,res.username,isAdmin);
    } catch (e) {
      this.errorService.handleError(e, todo);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const todo='logging in';
    const url = `${environment.apiUrl}/users/login`;
    const payload: LoginRequest = { email, password };
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
      const isAdmin = await this.checkAdmin(res.token);
      this.setToken(res.token,res.username,isAdmin);
    } catch (e) {
      this.errorService.handleError(e, todo);
    }
  }

  logout(): void {
    this.clearToken();
  }

  isLoggedIn(): boolean {
    return !!this.jwt();
  }
  isAdmin():boolean{
    return this.isAdminFlag();
  }

  async checkAdmin(token: string): Promise<boolean> {
    const todo = 'checking admin status';
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    try {
      return await firstValueFrom(this.http.get<boolean>(environment.apiUrl + "/users/is-admin", {headers}));

    } catch (e) {
      this.errorService.handleError(e, todo);
      return false;
    }
  }
  ngOnInit(){
    this.setToken(this.getTokenFromStorage(),this.getUsernameFromStorage(),this.getIsAdminFlagFromStorage());
  }

}
