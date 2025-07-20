jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const {
  getTracksInAlbum,
  addTrackToAlbum,
  removeTrackFromAlbum,
  updateTrackPosition,
  batchUpdatePositions,
} = require("../supabase/queries/albums");

describe("album_tracks queries", () => {
  let builder;

  beforeEach(() => {
    jest.resetAllMocks();

    // chainable builder stub
    builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockReturnValue(Promise.resolve({ data: null, error: null })),
    };

    supabase.from.mockReturnValue(builder);
  });

  test("getTracksInAlbum returns pivot rows", async () => {
    const rows = [
      {
        album_id: "A",
        track_id: "T1",
        position: 1,
        added_at: "2025-01-01T00:00:00Z",
      },
      {
        album_id: "A",
        track_id: "T2",
        position: 2,
        added_at: "2025-01-02T00:00:00Z",
      },
    ];
    // simulate .order → resolves with data
    builder.order.mockResolvedValueOnce({ data: rows, error: null });

    const res = await getTracksInAlbum("A");
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(builder.select).toHaveBeenCalledWith("*");
    expect(builder.eq).toHaveBeenCalledWith("album_id", "A");
    expect(res).toEqual(rows);
  });

  test("addTrackToAlbum inserts pivot and returns row", async () => {
    const row = {
      album_id: "A",
      track_id: "T3",
      position: 3,
      added_at: "2025-01-03T00:00:00Z",
    };
    builder.single.mockResolvedValueOnce({ data: row, error: null });

    const res = await addTrackToAlbum("A", "T3", 3);
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(builder.insert).toHaveBeenCalledWith({
      album_id: "A",
      track_id: "T3",
      position: 3,
    });
    expect(res).toEqual(row);
  });

  test("updateTrackPosition updates pivot and returns row", async () => {
    const updated = {
      album_id: "A",
      track_id: "T5",
      position: 5,
      added_at: "2025-01-05T00:00:00Z",
    };
    builder.single.mockResolvedValueOnce({ data: updated, error: null });

    const res = await updateTrackPosition("A", "T5", 5);
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(builder.update).toHaveBeenCalledWith({ position: 5 });
    expect(builder.eq).toHaveBeenCalledWith("album_id", "A");
    expect(builder.eq).toHaveBeenCalledWith("track_id", "T5");
    expect(res).toEqual(updated);
  });
});
