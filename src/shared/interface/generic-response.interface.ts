export class GenericResponse<T> {
  statusCode?: number;
  message: string;
  results: T;
}
