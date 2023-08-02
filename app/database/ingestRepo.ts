import { createSportServiceTable } from "./db";
import { randomUUID } from "crypto";
import { DynamoRepository } from "./dynamodbRepo";
import { IngestDataAttributes, IngestDataInputType } from "../types";

export class IngestRepository extends DynamoRepository<IngestDataAttributes> {
  private queryMatchIdIndex = this.queryIndex("GSI1");

  constructor() {
    super({
      name: "IngestData",
      table: createSportServiceTable() as any,
      attributes: {
        PK: {
          partitionKey: true,
          type: "string",
          prefix: "MATCHID#",
          default: (data: { match_id: string }) => data.match_id,
        },
        SK: {
          sortKey: true,
          type: "string",
          prefix: "TIMESTAMP#",
          default: (data: { timestamp: string }) => data.timestamp,
        },
        GSI1PK: {
          type: "string",
          default: (data: { match_id: string }) => data.match_id,
          onUpdate: true,
        },
        GSI1SK: {
          type: "string",
          default: (data: { match_id: string }) => data.match_id,
          onUpdate: true,
        },

        match_id: "string",
        timestamp: "string",
        team: "string",
        opponent: "string",
        event_type: "string",
        event_details: "map",
        eventId: "string",
      },
    });
  }

  async createEvent(params: IngestDataInputType): Promise<string> {
    const eventId = randomUUID().split("-")[0];
    await this.create({
      PK: params.match_id,
      SK: params.match_id,
      ...params,
      eventId,
    });
    return eventId;
  }

  async getEvents(match_id: string): Promise<IngestDataAttributes[]> {
    const events = await this.queryMatchIdIndex(match_id);
    return events;
  }
}
