import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb'


type Environment = 'local' | 'development' | 'production'
export const environment: Environment = (process.env.NODE_ENV ?? 'production') as Environment

type IndexField = {
  name: 'PK' | 'SK'
  type: AttributeType
}

type GSIIndexField = {
  name: string
  type: AttributeType
}

type GSI_PROJECTION =
  | {
      type: Exclude<ProjectionType, ProjectionType.INCLUDE>
      nonKeyAttributes?: never
    }
  | {
      type: ProjectionType.INCLUDE
      nonKeyAttributes: string[]
    }

type GSIConfig = {
  PK: GSIIndexField
  SK?: GSIIndexField
  projection?: GSI_PROJECTION
  name: string
}

type DynamoDBConfig = {
  mainTable: string
  stramTable: string  
  PK: IndexField
  SK?: IndexField
  gsiIndexes?: GSIConfig[]
}

type Config = {
  subStackVersion: number
  serviceName: string
  db: DynamoDBConfig
  aws: {
    region: string
    account: string
  }
  api: {
    domain: string
    subdomain: string
    certArn: string
  }
}

export const config: Config = {
  serviceName: 'sportService',
  subStackVersion: 1,
  aws: {
    region: 'eu-central-1',
    account: "",
  },
  api: {
    subdomain: 'sport-service',
    domain: "sport-service",
    certArn: ""
      //environment
      // === 'production'
        //? 'arn:aws:acm:eu-central-1:918914055277:certificate/fbd111f6-a7ca-43e9-9db8-566e63ce10fa'
    //    : 'arn:aws:acm:eu-central-1:710196519714:certificate/07680685-c4a6-4d4b-9a8c-d8c0dd80f5bb',
  },
  db: {
    mainTable: "ingestTable",
    stramTable: "streamTable",
    PK: {
      name: 'PK',
      type: AttributeType.STRING,
    },
    SK: {
      name: 'SK',
      type: AttributeType.STRING,
    },
    gsiIndexes: [
      {
        name: 'GSI1',
        PK: {
          name: 'GSI1PK',
          type: AttributeType.STRING,
        },
        SK: {
          name: 'GSI1SK',
          type: AttributeType.STRING,
        },
        projection: {
          type: ProjectionType.ALL,
        },
      },
    ],
  },
}
