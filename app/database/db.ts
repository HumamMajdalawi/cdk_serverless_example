import * as aws from 'aws-sdk'
import {
  AttributeDefinition,
  GlobalSecondaryIndex,
  KeySchemaElement,
} from 'aws-sdk/clients/dynamodb'
import { Table } from 'dynamodb-toolbox'
import { getEnv } from '../config'

const endpointUrl = getEnv('dynamoDbEndpoint')
const tableName = getEnv('dynamoTable')

const getDocClientConfig = (): Record<string, unknown> => {
  const nodeEnv = process.env.NODE_ENV === 'test'
  return nodeEnv ? { endpoint: endpointUrl, region: getEnv('region') } : {}
}

export const createSportServiceTable = (
  options: { entityField: boolean | string } = { entityField: '_et' },
) => {
  return new Table({
    entityField: options.entityField,
    removeNullAttributes: false,
    name: tableName,
    partitionKey: 'PK',
    sortKey: 'SK',
   DocumentClient: new aws.DynamoDB.DocumentClient(getDocClientConfig()),
    indexes: {
      GSI1: { partitionKey: 'GSI1PK', sortKey: 'GSI1SK' },
    },
  }) 
}

const attributeDefinitions: AttributeDefinition[] = [
  { AttributeName: 'PK', AttributeType: 'S' },
  { AttributeName: 'SK', AttributeType: 'S' },
  { AttributeName: 'GSI1PK', AttributeType: 'S' },
  { AttributeName: 'GSI1SK', AttributeType: 'S' },
]

const keySchemas: KeySchemaElement[] = [
  { AttributeName: 'PK', KeyType: 'HASH' },
  { AttributeName: 'SK', KeyType: 'RANGE' },
]

const gsis: GlobalSecondaryIndex[] = [
  {
    IndexName: 'GSI1',
    KeySchema: [
      { AttributeName: 'GSI1PK', KeyType: 'HASH' },
      { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
    ],
    Projection: {
      ProjectionType: 'ALL',
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
]

export const createLocalDbTable = async (): Promise<void> => {
  const x = getDocClientConfig()
  const db = new aws.DynamoDB(x)
  console.log("I am here! ", x)
  const { TableNames } = await db.listTables({"Limit":2}).promise()

  if (!TableNames?.includes(tableName))
    await db
      .createTable({
        GlobalSecondaryIndexes: gsis,
        TableName: tableName,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchemas,
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
      .promise()
}

export const deleteLocalDBTable = async (): Promise<void> => {
  const db = new aws.DynamoDB(getDocClientConfig())
  await db.deleteTable({ TableName: tableName }).promise()
}
