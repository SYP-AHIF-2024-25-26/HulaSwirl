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
  private readonly modalService = inject(ModalService);
  private apiBaseUrl = inject(BASE_URL);
  private userWsUrl = inject(USER_WS_URL);
  private ws?: WebSocket;

  jwt = signal<string | null>(this.getTokenFromStorage());
  username = signal<string | null>(this.getUsernameFromStorage());
  private role = signal<string | null>(this.getRoleFromStorage());
  private isAdminFlag = signal<boolean>(false);
  private isOperatorFlag = signal<boolean>(false);
  private isSystemFlag = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.updateUserRole();
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

  private getRoleFromStorage(): string | null {
    return localStorage.getItem('role');
  }

  private decodeRole(token: string): string | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload["role"] ?? payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null;
    } catch {
      return null;
    }
  }

  private setToken(token: string | null, username: string | null): void {
    if (token) {
      localStorage.setItem('jwt', token);
      this.jwt.set(token);
      const role = this.decodeRole(token);
      if (role) {
        localStorage.setItem('role', role);
        this.role.set(role);
      }
    }

    if (username) {
      localStorage.setItem('username', username);
      this.username.set(username);
    }
  }

  private clearToken(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.jwt.set(null);
    this.username.set(null);
    this.role.set(null);
  }

  private connectWebSocket() {
    const token = this.getTokenFromStorage();
    if (!token) {
      return;
    }
    this.ws = new WebSocket(`${this.userWsUrl}?token=${token}`);
    console.log("Connecting to WebSocket at", this.userWsUrl);
    this.ws.onmessage = async evt => {
      console.log(evt.data);
      const data: { eventType: string; role?: string } = JSON.parse(evt.data);
      console.log(data);
      if (data.eventType === 'deleted') {
        await this.logout();
      } else if (data.eventType === 'role-changed' && data.role) {
        this.updateUserRole(data.role);
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
    this.updateUserRole();
    this.connectWebSocket();
  }

  async login(username: string, key: string): Promise<void> {
    const url = `${this.apiBaseUrl}/users/login`;
    const payload: LoginRequest = {username, key};
    const res = await firstValueFrom(this.http.post<AuthResponse>(url, payload));
    this.setToken(res.token, res.username);
    this.updateUserRole();
    this.connectWebSocket();
  }

  async logout() {
    this.clearToken();
    this.disconnectWebSocket();
    this.modalService.closeModal();
    this.updateUserRole();
    await this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!this.jwt();
  }

  private updateUserRole(roleOverride?: string) {
    const role = roleOverride ? roleOverride : this.jwt() ? this.decodeRole(this.jwt()!) : null;
    if (role) {
      localStorage.setItem('role', role);
      this.role.set(role);
    } else {
      localStorage.removeItem('role');
      this.role.set(null);
    }
    this.isOperatorFlag.set(role === 'operator' || role === 'admin' || role === 'system');
    this.isAdminFlag.set(role === 'admin' || role === 'system');
    this.isSystemFlag.set(role === 'system');
  }

  getRole(): string | null {
    return this.role();
  }

  hasRole(role: string): boolean {
    return this.role()?.toLowerCase() === role.toLowerCase();
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
