// tests/tracks.test.js

// 1) Mock the Supabase client
jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const tracks = require("../supabase/queries/tracks");

describe("tracks queries", () => {
  let builder;

  beforeEach(() => {
    jest.resetAllMocks();

    builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    supabase.from.mockReturnValue(builder);
  });

  test("getTracksByUser returns parsed tracks", async () => {
    const fake = [
      {
        id: "1",
        owner_id: "u1",
        title: "T1",
        artist: null,
        album_id: null,
        track_date: null,
        file_url: "u",
        file_size: 123,
        duration_secs: 60,
        cover_art_url: null,
        is_public: true,
        waveform_data: null,
        created_at: "c",
        updated_at: "u",
      },
    ];
    builder.order.mockResolvedValueOnce({ data: fake, error: null });

    const res = await tracks.getTracksByUser("u1");
    expect(supabase.from).toHaveBeenCalledWith("tracks");
    expect(builder.eq).toHaveBeenCalledWith("owner_id", "u1");
    expect(res).toEqual(fake);
  });

  test("getTrackById returns a single track", async () => {
    const one = {
      id: "2",
      owner_id: "u2",
      title: "T2",
      artist: "A",
      album_id: "a1",
      track_date: "2025-01-01",
      file_url: "u2",
      file_size: 200,
      duration_secs: 120,
      cover_art_url: "c",
      is_public: false,
      waveform_data: {},
      created_at: "x",
      updated_at: "y",
    };
    builder.single.mockResolvedValueOnce({ data: one, error: null });

    const res = await tracks.getTrackById("2");
    expect(supabase.from).toHaveBeenCalledWith("tracks");
    expect(builder.eq).toHaveBeenCalledWith("id", "2");
    expect(res).toEqual(one);
  });

  test("createTrack inserts and returns new track", async () => {
    const input = {
      owner_id: "u4",
      title: "New",
      artist: null,
      album_id: null,
      track_date: null,
      file_url: "fu",
      file_size: 321,
      duration_secs: 30,
      cover_art_url: null,
      is_public: false,
      waveform_data: null,
    };
    const created = { ...input, id: "n1", created_at: "t1", updated_at: "t2" };
    builder.single.mockResolvedValueOnce({ data: created, error: null });

    const res = await tracks.createTrack(input);
    expect(supabase.from).toHaveBeenCalledWith("tracks");
    expect(builder.insert).toHaveBeenCalledWith(input);
    expect(res).toEqual(created);
  });

  test("updateTrack patches and returns updated track", async () => {
    const patch = { id: "5", title: "X" };
    const returned = {
      id: "5",
      owner_id: "u5",
      title: "X",
      artist: null,
      album_id: null,
      track_date: null,
      file_url: "u5",
      file_size: 0,
      duration_secs: 0,
      cover_art_url: null,
      is_public: true,
      waveform_data: null,
      created_at: "c",
      updated_at: "u",
    };
    builder.single.mockResolvedValueOnce({ data: returned, error: null });

    const res = await tracks.updateTrack(patch);
    expect(supabase.from).toHaveBeenCalledWith("tracks");
    expect(builder.update).toHaveBeenCalledWith({ title: "X" });
    expect(builder.eq).toHaveBeenCalledWith("id", "5");
    expect(res).toEqual(returned);
  });

  test("deleteTrack deletes and returns id", async () => {
    builder.single.mockResolvedValueOnce({ data: { id: "6" }, error: null });

    const res = await tracks.deleteTrack("6");
    expect(supabase.from).toHaveBeenCalledWith("tracks");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "6");
    expect(res).toEqual({ id: "6" });
  });
});
