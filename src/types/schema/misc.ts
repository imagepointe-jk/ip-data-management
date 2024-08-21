import { z } from "zod";

export const sortingDirections = ["Ascending", "Descending"] as const;
export const sortingDirectionSchema = z.enum(sortingDirections);

export type SortingDirection = z.infer<typeof sortingDirectionSchema>;
export type ResultsPagination = {
  perPage: number;
  pageNumber: number;
  totalResults: number;
};
export type ServerActionResult = {
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
};

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
