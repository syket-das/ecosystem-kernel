// src/utils/response.ts
import { Response } from 'express';

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  errors: string[];
}

export const sendApiResponse = <T>(
  res: Response<ApiResponse<T>>,
  code: number,
  data: T,
  message: string,
  errors: string[] = []
) => {
  const response: ApiResponse<T> = {
    code,
    data,
    message,
    errors,
  };
  res.status(code).json(response);
};
