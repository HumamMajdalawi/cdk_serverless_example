import { createSportServiceTable } from './db'
import { randomUUID } from 'crypto'
import { DynamoRepository } from './dynamodbRepo'
import { IngestDataAttributes, IngestDataInputType } from '../types'


export class IngestRepository extends DynamoRepository<IngestDataAttributes> {
  constructor() {
    super({
      name: 'IngestData',
      table:  createSportServiceTable() as any,
      attributes: {
        PK: {
          partitionKey: true,
          type: 'string',
          prefix: 'MATCHID#',
          default: (data: { matchId: string }) => data.matchId,
        },
        SK: {
          sortKey: true,
          type: 'string',
          prefix: 'TIMESTAMP#',
          default: (data: { timestamp: string }) => data.timestamp,
        },
        matchId: 'string',
        timestamp: "string",
        team: "string",
        opponent: "string",
        event_type: "string",
        event_details: "map",
        eventId: "string"
      },
    })
  }


  async createEvent(params: IngestDataInputType): Promise<string> {
    const eventId = randomUUID().split("-")[0]
    await this.create({PK: params.match_id, SK:params.timestamp ,...params, eventId})
    return eventId
  }
 
}
