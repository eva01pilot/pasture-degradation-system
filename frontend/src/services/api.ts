import axios, { type AxiosInstance } from "axios";
export class Api {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
  }

  setToken(token: string) {
    this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}
