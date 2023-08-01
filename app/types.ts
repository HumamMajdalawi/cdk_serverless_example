export const IngestDataInput = {
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

export type IngestDataInputType = {
  match_id: string;
  timestamp: string;
  team: string;
  opponent: string;
  event_type: string;
  event_details: EventDetailType;
};

export type IngestDataAttributes = {
  _et?: string;
  _ct?: string;
  _md?: string;
  PK: string
  SK: string
  match_id: string;
  timestamp: string;
  team: string;
  opponent: string;
  event_type: string;
  event_details: EventDetailType;
  eventId?: string;
};

export type EventDetailType = {
  player: PlayerType;
  goal_type: string;
  minute: number;
  assist: AssistType;
  video_url: string;
};

export type PlayerType = {
  name: string;
  position: string;
  number: number;
};

export type AssistType = {
  name: string;
  position: string;
  number: number;
};

const SuccessMsg = {
  status: "success",
  message: "Data successfully ingested.",
  data: {
    event_id: "abc123",
    timestamp: "2023-06-22T19:45:30Z",
  },
};

export type SuccessMsgType = typeof SuccessMsg;
