import { LambdaIntegrationOptions } from "aws-cdk-lib/aws-apigateway"
import { Construct } from "constructs"
import { config } from "./config"

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
    environment: {
      mainTable: config.db.mainTable
    }
  },
  {
    id: 'getMatches',
    handler: 'handlers/getMatches.handler',
    api: {
      path: '/matches',
      method: 'GET',
    },
    environment: {
      mainTable: config.db.mainTable
    }
  },
  {
    id: 'getMatch',
    handler: 'handlers/getMatch.handler',
    api: {
      path: '/matches/{match_id}',
      method: 'GET',
    }, 
    environment: {
      mainTable: config.db.mainTable
    }
  },
  // {
  //   id: 'getMatchStatistics',
  //   handler: 'handlers/getMatchStatistics.handler',
  //   api: {
  //     path: '/matches/{match_id}/statistics',
  //     method: 'GET',
  //   },
  //   environment: {
  //     stramTable: config.db.stramTable
  //   }
  // },
]