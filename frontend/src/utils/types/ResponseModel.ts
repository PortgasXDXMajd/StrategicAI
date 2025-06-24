export interface ResponseModel<T> {
  result: number;
  message: string;
  body: T;
}
