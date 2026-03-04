import { API_URLS } from "@/consts/api-urls";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";
import { HttpService } from "./HttpService";

export class TodoService {
  private static readonly api = HttpService.getInstance(API_URLS.TODO).getClient();

  static async getAll(): Promise<Todo[]> {
    const { data } = await this.api.get<Todo[]>(API_URLS.TODO_GET_ALL);
    return data;
  }

  static async create(dto: CreateTodoDto): Promise<Todo> {
    const { data } = await this.api.post<Todo>(API_URLS.TODO_CREATE, dto);
    return data;
  }

  static async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const url = API_URLS.TODO_UPDATE.replace(":id", id);
    const { data } = await this.api.put<Todo>(url, dto);
    return data;
  }

  static async toggleDone(id: string): Promise<Todo> {
    const url = API_URLS.TODO_DONE.replace(":id", id);
    const { data } = await this.api.patch<Todo>(url);
    return data;
  }

  static async delete(id: string): Promise<void> {
    const url = API_URLS.TODO_DELETE.replace(":id", id);
    await this.api.delete(url);
  }
}
