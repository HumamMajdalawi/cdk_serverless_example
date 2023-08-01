import { LambdaIntegrationOptions } from "aws-cdk-lib/aws-apigateway"
import { Construct } from "constructs"

type BaseLambdaTrigger = {
  id: string
  handler: string
  environment?: Record<string, string>
}

export type ApiTrigger = BaseLambdaTrigger & {
  lambdaIntegration?: LambdaIntegrationOptions
  api: {
    path: string
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH'
  }
}


export const routes = (stack: Construct): ApiTrigger[] => [

  {
    id: 'ingestData',
    handler: 'handlers/postIngestData.handler',
    api: {
      path: '/ingest',
      method: 'POST',
    },
  },
]