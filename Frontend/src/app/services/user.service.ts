import {effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {BASE_URL, USER_WS_URL} from '../app.config';
import {Router} from '@angular/router';
import {ModalService} from './modal.service';

interface RegisterRequest {
  username: string;
  key: string;
}

interface LoginRequest {
  username: string;
  key: string;
}

interface DecodedUser {
  username: string;
  role: string;
}

export interface AccountInfo {
  username: string;
  role: string;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface ManagedUser {
  username: string;
  role: string;
  createdAt: Date;
  lastLogin: Date | null;
  status: string;
}

export interface AccountModalData {
  user: AccountInfo;
  context?: 'self' | 'admin';
  onUpdated?: () => Promise<void> | void;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private apiBaseUrl = inject(BASE_URL);
  private userWsUrl = inject(USER_WS_URL);
  private ws?: WebSocket;

  public username = signal<string | null>(null);
  public role = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.setUser(this.getTokenFromStorage());
    });
    if (this.getTokenFromStorage()) {
      this.connectWebSocket();
    }
  }

  public getTokenFromStorage(): string | null {
    return localStorage.getItem('jwt');
  }

  private decodeToken(token: string | null): DecodedUser | null {
    if (!token) {
      return null;
    }
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return { username: payload.sub, role: payload["role"] ?? payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null };
    } catch {
      return null;
    }
  }

  private setUser(token: string | null): void {
    const user = this.decodeToken(token);
    if (user) {
      localStorage.setItem('jwt', token!);
      this.username.set(user.username);
      this.updateUserRole(user.role);
    }
  }

  private clearUser(): void {
    localStorage.removeItem('jwt');
    this.username.set(null);
    this.updateUserRole();
  }

  private connectWebSocket() {
    const token = this.getTokenFromStorage();
    if (!token) {
      return;
    }
    this.ws = new WebSocket(`${this.userWsUrl}?token=${token}`);
    this.ws.onmessage = async evt => {
      const data: { eventType: string; token?: string } = JSON.parse(evt.data);
      if (data.eventType === 'deleted') {
        await this.logout();
      } else if (data.eventType === 'role-changed' && data.token) {
        this.setUser(data.token);
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
    const res = await firstValueFrom(this.http.post<string>(url, payload));
    this.setUser(res);
    this.connectWebSocket();
  }

  async login(username: string, key: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users/login`;
    const payload: LoginRequest = {username, key};
    const res = await firstValueFrom(this.http.post<string>(url, payload));
    this.setUser(res);
    this.connectWebSocket();
  }

  async logout() {
    this.clearUser();
    this.disconnectWebSocket();
    this.modalService.closeModal();
    await this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.getTokenFromStorage();
  }

  private updateUserRole(role?: string) {
    this.role.set(role ? role.toLowerCase() : null);
  }

  hasRole(role: string): boolean {
    if(role === 'system') {
      return this.role() === 'system';
    } else if (role === 'admin') {
      return this.role() === 'admin' || this.role() === 'system';
    } else if (role === 'operator') {
      return this.role() === 'operator' || this.role() === 'admin' || this.role() === 'system';
    } else {
      return this.role() === role;
    }
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
    const res = await firstValueFrom(this.http.get<AccountInfo>(this.apiBaseUrl + "/users/info", {headers}));
    return {
      ...res,
      createdAt: new Date(res.createdAt),
      lastLogin: res.lastLogin ? new Date(res.lastLogin) : null
    };
  }

  async getAllUsers() {
    const token = this.getTokenFromStorage();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    const res = await firstValueFrom(this.http.get<ManagedUser[]>(`${this.apiBaseUrl}/users`, {headers}));
    return res.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      status: ''
    }));
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

  async resetUserKey(username: string, newKey: string) {
    const token = this.getTokenFromStorage();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
    const res = await firstValueFrom(this.http.post<string | null>(`${this.apiBaseUrl}/users/${username}/reset-key`, { newKey }, {headers}));
    if (res) {
      // If backend returns a refreshed token, update the local session
      this.setUser(res);
    }
  }
}
