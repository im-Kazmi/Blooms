import type { Prisma } from '@repo/database';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortingParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class QueryUtils {
  static getPaginationParams(params: PaginationParams) {
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    return { skip, take };
  }

  static getSortingParams<T extends string>(params: SortingParams<T>) {
    const { sortBy, sortOrder = 'asc' } = params;
    if (sortBy) {
      return { [sortBy]: sortOrder };
    }
    return undefined;
  }

  static async paginateQuery<T>(
    query: Prisma.PrismaPromise<T[]>,
    model: { count: () => Prisma.PrismaPromise<number> },
    params: PaginationParams
  ): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 10 } = params;
    const data = await query;
    const total = await model.count();
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
