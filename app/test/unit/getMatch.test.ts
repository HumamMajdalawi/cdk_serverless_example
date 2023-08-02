import {  GetMatchController } from "../../handlers/getMatch";
import { PostIngestDataController } from "../../handlers/postIngestData";
import { Request } from "../../util/apiGateway";

const match1 = {
    match_id: "12345",
    timestamp: "2023-06-22T19:45:30Z",
    team: "FC Barcelona",
    opponent: "Real Madrid",
    event_type: "goal",
    event_details: {
      player: {
        name: "Lionel Messi",
        position: "Forward",
        number: 10,
      },
      goal_type: "penalty",
      minute: 30,
      assist: {
        name: "Sergio Busquets",
        position: "Midfielder",
        number: 5,
      },
      video_url: "https://example.com/goal_video.mp4",
    },
  };
  
  const match2 = {
    match_id: "54321",
    timestamp: "2023-06-22T19:45:30Z",
    team: "FC Barcelona",
    opponent: "Real Madrid",
    event_type: "goal",
    event_details: {
      player: {
        name: "Lionel Messi",
        position: "Forward",
        number: 10,
      },
      goal_type: "penalty",
      minute: 30,
      assist: {
        name: "Sergio Busquets",
        position: "Midfielder",
        number: 5,
      },
      video_url: "https://example.com/goal_video.mp4",
    },
  };

describe("Get Match Endpoint", () => {

    it("Get Match By Id", async() => {
        const postIngestcontroller = new PostIngestDataController();
        const mockRequest1 = new Request(match1, {}, {}, {});
        const mockRequest2 = new Request(match2, {}, {}, {});
        await Promise.all([
          postIngestcontroller.handle(mockRequest1),
          postIngestcontroller.handle(mockRequest2),
        ]);

        const request = new Request(null, {},{match_id: "12345"},{})
        const controller = new GetMatchController()
        const res = await controller.handle(request)
        const matchId = res.getData()?.match.match_id
        expect(matchId).toBe(match1.match_id)
    })
})