import {effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {StatusService} from './status.service';
import {BASE_URL} from '../app.config';
import {Router} from '@angular/router';

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
  private readonly router = inject(Router);
  private apiBaseUrl = inject(BASE_URL);

  jwt = signal<string | null>(this.getTokenFromStorage());
  username = signal<string | null>(this.getUsernameFromStorage());
  private isAdminFlag = signal<boolean>(false);
  private isOperatorFlag = signal<boolean>(false);

  constructor() {
    effect(async () => {
      await this.updateUserRole();
    });
  }

  public getTokenFromStorage(): string | null {
    return localStorage.getItem('jwt');
  }

  private getUsernameFromStorage(): string | null {
    return localStorage.getItem('username');
  }

  private setToken(token: string | null, username: string | null): void {
    if (token) {
      localStorage.setItem('jwt', token);
      this.jwt.set(token);
    }

    if (username) {
      localStorage.setItem('username', username);
      this.username.set(username);
    }
  }

  private clearToken(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdminFlag')
    this.jwt.set(null);
    this.username.set(null);
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users`;
    const payload: RegisterRequest = {username, email, password};
    const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
    this.setToken(res.token, res.username);
  }

  async login(email: string, password: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users/login`;
    const payload: LoginRequest = {email, password};
    const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
    this.setToken(res.token, res.username);
    await this.updateUserRole();
  }

  async logout() {
    this.clearToken();
    await this.updateUserRole();
    await this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.jwt();
  }

  private async updateUserRole() {
    this.isAdminFlag.set(await this.isAdmin());
    this.isOperatorFlag.set(await this.isOperator());
  }

  getAdminStatus() {
    return this.isAdminFlag()
  }

  getOperatorStatus() {
    return this.isOperatorFlag();
  }

  private async isAdmin(): Promise<boolean> {
    const token = this.getTokenFromStorage();
    if (!token) {
      return false;
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<boolean>(this.apiBaseUrl + "/users/is-admin", {headers}));
  }

  private async isOperator(): Promise<boolean> {
    const token = this.getTokenFromStorage();
    if (!token) {
      return false;
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<boolean>(this.apiBaseUrl + "/users/is-operator", {headers}));
  }
}
