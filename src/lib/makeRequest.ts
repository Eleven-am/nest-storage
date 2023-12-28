import { ZodType } from 'zod';

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';
type PrimitiveType = string | number | boolean | null | undefined | unknown;
type Headers = Record<string, string>;
type Body = Record<string, any> | string | null;
type Query = Record<string, PrimitiveType | PrimitiveType[]>;
export type FetchType = typeof fetch;

export interface MakeRequest {
  method: Method;
  headers?: Headers;
  body?: Body;
  query?: Query;
  address: string;
  abortSignal?: AbortSignal;
}

function performFetch({
  method,
  headers,
  body,
  query,
  address,
  abortSignal,
}: MakeRequest) {
  const url = new URL(address);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((value) => url.searchParams.append(key, String(value)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: abortSignal,
  });
}

function getData(params: MakeRequest) {
  return new Promise<unknown>((resolve, reject) => {
    performFetch(params)
      .then((response) => {
        const isJson =
          response.headers.get('content-type')?.includes('application/json') ??
          false;
        const statusCode = response.status;
        const statusText = response.statusText;
        const isOk = response.ok;

        if (!isOk) {
          reject({
            statusCode,
            statusText,
          });
        }

        if (isJson) {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          response
            .text()
            .then((text) => {
              resolve(text);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function makeRequest<DataType>(
  params: MakeRequest,
  schema?: ZodType<DataType>,
): Promise<DataType> {
  const data = await getData(params);
  if (schema) {
    return schema.parse(data);
  }
  return data as DataType;
}
