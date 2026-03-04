export interface Todo {
  _id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTodoDto = {
  title: string;
  description?: string;
};

export type UpdateTodoDto = {
  title?: string;
  description?: string;
};
