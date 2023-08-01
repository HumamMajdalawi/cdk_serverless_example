import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { getEnv } from "../config";

export interface Controller<RequestData, ResponseData> {
  handle(req: Request<RequestData>): Promise<Response<ResponseData>>;
}

export const makeAwsGatewayResponse = <T>(
  res: Response<T>,
): APIGatewayProxyResult => {
  const responseData = res.getData();

  const allowedOrigins = getEnv("allowedOrigins", "").split(",");

  let headers = res.getHeaders();

  headers = {
    ...headers,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Amz-Date, X-Api-Key",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PATCH, DELETE",
  };

  if (Buffer.isBuffer(responseData)) {
    return {
      headers,
      statusCode: res.getStatusCode(),
      body: responseData.toString("base64"),
      isBase64Encoded: true,
    };
  }
  return {
    headers,
    statusCode: res.getStatusCode(),
    body: JSON.stringify(responseData),
  };
};

export const createControllerHandler =
  <T, U>(
    controller: Controller<T, U>
  ): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info(JSON.stringify(event, null, 2));

    try {
      const request = new AwsApiGatewayRequest<T>(event);
      const response = await controller.handle(request);

      if (typeof response === "undefined") {
        const err = new Error("Unexpected void response");
        throw err;
      }

      return makeAwsGatewayResponse(response);
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "unknown error",
        }),
        headers: {},
      };
    }
  };

export class Request<T> {
  public constructor(
    private data: T,
    private headers: Record<string, string> = {},
    private pathParameters: Record<string, string> = {},
    private queryParameters: Record<string, unknown> = {}
  ) {}

  public getData(): T {
    return this.data;
  }

  public getPathParameters(): Record<string, string> {
    return this.pathParameters;
  }

  public getQueryParameters(): Record<string, unknown> {
    return this.queryParameters || {};
  }

  public getHeaders(): Record<string, string> {
    return this.headers;
  }
}

export class AwsApiGatewayRequest<T> extends Request<T> {
  constructor(event: APIGatewayProxyEvent) {
    super(
      JSON.parse(event.body as any) as T,
      event.headers as Record<string, string>,
      event.pathParameters as Record<string, string>,
      event.queryStringParameters as Record<string, string>
    );
  }
}

export class Response<T> {
  public constructor(
    private data: T | null,
    private headers: Record<string, string>,
    private statusCode: number
  ) {}

  public getData(): T | null {
    return this.data;
  }

  public getStatusCode(): number {
    return this.statusCode;
  }

  public getHeaders(): Record<string, string> {
    return this.headers;
  }

  public static CONFLICT<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 409);
  }

  public static OK<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 200);
  }

  public static CREATED<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 201);
  }
  public static OK_NO_CONTENT<T>(
    headers: Record<string, string> = {}
  ): Response<T | null> {
    return new Response(null, headers, 204);
  }

  public static BAD_REQUEST<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 400);
  }
  public static UNAUTHORIZED<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 401);
  }
  public static FORBIDDEN<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 403);
  }
  public static NOT_FOUND<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 404);
  }
  public static VALIDATION_FAILED<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 422);
  }

  public static SERVER_ERROR<T>(
    data: T,
    headers: Record<string, string> = {}
  ): Response<T> {
    return new Response(data, headers, 500);
  }
}
