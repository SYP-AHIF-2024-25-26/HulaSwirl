import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {StatusService} from './status.service';
import {BASE_URL} from '../app.config';

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
  private readonly errorService = inject(StatusService);
  private apiBaseUrl = inject(BASE_URL);

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
    const url = `${this.apiBaseUrl}/users`;
    const payload: RegisterRequest = { username, email, password };
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
      const isAdmin = await this.checkAdmin(res.token);
      this.setToken(res.token,res.username,isAdmin);
    } catch (e) {
      this.errorService.handleError(e);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users/login`;
    const payload: LoginRequest = { email, password };
    try {
      const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
      const isAdmin = await this.checkAdmin(res.token);
      this.setToken(res.token,res.username,isAdmin);
    } catch (e) {
      this.errorService.handleError(e);
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
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<boolean>(this.apiBaseUrl + "/users/is-admin", {headers}));
  }
  ngOnInit(){
    this.setToken(this.getTokenFromStorage(),this.getUsernameFromStorage(),this.getIsAdminFlagFromStorage());
  }
}
