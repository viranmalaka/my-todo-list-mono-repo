import axios, { type AxiosInstance } from "axios";

const API_DOMAIN = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export class HttpService {
  private static readonly instances = new Map<string, HttpService>();
  private readonly client: AxiosInstance;

  private constructor(basePath: string) {
    this.client = axios.create({
      baseURL: `${API_DOMAIN}${basePath}`,
      headers: { "Content-Type": "application/json" },
    });

    // Centralised response/error normalisation
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message =
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          error.message ||
          "Something went wrong";
        return Promise.reject(new Error(message));
      }
    );
  }

  static getInstance(basePath: string = ""): HttpService {
    if (!HttpService.instances.has(basePath)) {
      HttpService.instances.set(basePath, new HttpService(basePath));
    }
    return HttpService.instances.get(basePath)!;
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}
