import {effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ErrorService} from './error.service';
import {BASE_URL, USER_WS_URL} from '../app.config';
import {Router} from '@angular/router';

interface RegisterRequest {
  username: string;
  key: string;
}

interface LoginRequest {
  username: string;
  key: string;
}

interface AuthResponse {
  token: string;
  username: string;
}

export interface AccountInfo {
  username: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface ManagedUser {
  username: string;
  role: string;
  createdAt: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private apiBaseUrl = inject(BASE_URL);
  private userWsUrl = inject(USER_WS_URL);
  private ws?: WebSocket;

  jwt = signal<string | null>(this.getTokenFromStorage());
  username = signal<string | null>(this.getUsernameFromStorage());
  private isAdminFlag = signal<boolean>(false);
  private isOperatorFlag = signal<boolean>(false);
  private isSystemFlag = signal<boolean>(false);

  constructor() {
    effect(async () => {
      await this.updateUserRole();
    });
    if (this.jwt()) {
      this.connectWebSocket();
    }
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

  private connectWebSocket() {
    const token = this.getTokenFromStorage();
    if (!token) {
      return;
    }
    this.ws = new WebSocket(`${this.userWsUrl}?token=${token}`);
    this.ws.onmessage = async evt => {
      const data: { eventType: string; role?: string } = JSON.parse(evt.data);
      if (data.eventType === 'deleted') {
        await this.logout();
      } else if (data.eventType === 'role-changed') {
        await this.updateUserRole();
      }
    };
    this.ws.onerror = () => console.error('WS-Error user');
  }

  private disconnectWebSocket() {
    this.ws?.close();
  }

  async register(username: string, key: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users`;
    const payload: RegisterRequest = {username, key};
    const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
    this.setToken(res.token, res.username);
    this.connectWebSocket();
  }

  async login(username: string, key: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users/login`;
    const payload: LoginRequest = {username, key};
    const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
    this.setToken(res.token, res.username);
    await this.updateUserRole();
    this.connectWebSocket();
  }

  async logout() {
    this.clearToken();
    this.disconnectWebSocket();
    await this.updateUserRole();
    await this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.jwt();
  }

  private async updateUserRole() {
    this.isAdminFlag.set(await this.isAdmin());
    this.isOperatorFlag.set(await this.isOperator());
    this.isSystemFlag.set(await this.isSystem());
  }

  getAdminStatus() {
    return this.isAdminFlag() || this.isSystemFlag();
  }

  getOperatorStatus() {
    return this.isOperatorFlag();
  }

  getSystemStatus() {
    return this.isSystemFlag();
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

  private async isSystem(): Promise<boolean> {
    const token = this.getTokenFromStorage();
    if (!token) {
      return false;
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<boolean>(this.apiBaseUrl + "/users/is-system", {headers}));
  }

  async getUserInfo() {
    const token = this.getTokenFromStorage();
    if (!token) {
      return null;
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<AccountInfo>(this.apiBaseUrl + "/users/info", {headers}));
  }

  async getAllUsers() {
    const token = this.getTokenFromStorage();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    return await firstValueFrom(this.http.get<ManagedUser[]>(`${this.apiBaseUrl}/users`, {headers}));
  }

  async updateRole(username: string, role: string) {
    const token = this.getTokenFromStorage();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    await firstValueFrom(this.http.patch(`${this.apiBaseUrl}/users/${username}/role?role=${role}`, null, {headers}));
  }

  async deleteUser(username: string) {
    const token = this.getTokenFromStorage();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    await firstValueFrom(this.http.delete(`${this.apiBaseUrl}/users/${username}`, {headers}));
  }
}
