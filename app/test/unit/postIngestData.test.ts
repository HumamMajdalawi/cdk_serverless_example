import { MatchesRepository } from "../../database/matchesRepo";
import { PostIngestDataController } from "../../handlers/postIngestData";
import { IngestDataInput } from "../../types";
import { Request } from "../../util/apiGateway";

describe("Post Ingest Data Controller", () => {
  it("Should return validation error", async () => {
    const controller = new PostIngestDataController();
    const input = { ...IngestDataInput, team: {} };
    const request = new Request(input, {}, {}, {});
    const res = await controller.handle(request as any);
    expect(res.getStatusCode()).toBe(422);
  });

  it("Should insert one event and one match", async () => {
    const controller = new PostIngestDataController();
    const request = new Request(IngestDataInput, {}, {}, {});
    const res = await controller.handle(request);

    const eventId = res.getData()?.data.event_id;

    const matchRepo = new MatchesRepository();
    const match = await matchRepo.getMatch(
      IngestDataInput.match_id,
      IngestDataInput.team
    );
    expect(eventId).toBeDefined();
    expect(match.match_id).toBe(IngestDataInput.match_id);
  });
});
