jest.mock("../supabase/client", () => {
  // we'll override .from in each test's beforeEach
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

const { supabase } = require("../supabase/client");
const albums = require("../supabase/queries/albums");

describe("albums queries", () => {
  let builder;

  beforeEach(() => {
    jest.resetAllMocks();

    // A chainable stubbed builder
    builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    // supabase.from(...) ⇒ builder
    supabase.from.mockReturnValue(builder);
  });

  test("getAlbumsByUser returns parsed albums", async () => {
    const fake = [
      {
        id: "1",
        owner_id: "u",
        title: "T",
        description: null,
        cover_art_url: null,
        is_public: true,
        created_at: "x",
        updated_at: "y",
      },
    ];
    // simulate .order → resolves
    builder.order.mockResolvedValueOnce({ data: fake, error: null });

    const res = await albums.getAlbumsByUser("u");
    expect(supabase.from).toHaveBeenCalledWith("albums");
    expect(res).toEqual(fake);
  });

  test("getAlbumById returns a single album", async () => {
    const one = {
      id: "1",
      owner_id: "u",
      title: "T",
      description: null,
      cover_art_url: null,
      is_public: false,
      created_at: "x",
      updated_at: "y",
    };
    // chain: .single resolves
    builder.single.mockResolvedValueOnce({ data: one, error: null });

    const res = await albums.getAlbumById("1");
    expect(supabase.from).toHaveBeenCalledWith("albums");
    expect(res).toEqual(one);
  });

  test("createAlbum inserts and returns created album", async () => {
    const input = {
      owner_id: "u",
      title: "New",
      description: null,
      cover_art_url: null,
      is_public: true,
    };
    const created = { ...input, id: "abc", created_at: "t1", updated_at: "t2" };

    builder.single.mockResolvedValueOnce({ data: created, error: null });

    const res = await albums.createAlbum(input);
    expect(supabase.from).toHaveBeenCalledWith("albums");
    expect(res).toEqual(created);
  });

  test("updateAlbum patches and returns updated record", async () => {
    const patch = { id: "1", title: "X" };
    const updated = {
      id: "1",
      owner_id: "u",
      title: "X",
      description: null,
      cover_art_url: null,
      is_public: false,
      created_at: "a",
      updated_at: "b",
    };

    builder.single.mockResolvedValueOnce({ data: updated, error: null });

    const res = await albums.updateAlbum(patch);
    expect(supabase.from).toHaveBeenCalledWith("albums");
    expect(res).toEqual(updated);
  });

  test("deleteAlbum deletes and returns id", async () => {
    builder.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });

    const res = await albums.deleteAlbum("1");
    expect(supabase.from).toHaveBeenCalledWith("albums");
    expect(res).toEqual({ id: "1" });
  });

  test("getTracksInAlbum returns pivot rows", async () => {
    const rows = [
      { album_id: "a", track_id: "t", position: 1, added_at: "now" },
    ];
    builder.order.mockResolvedValueOnce({ data: rows, error: null });

    const res = await albums.getTracksInAlbum("a");
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(res).toEqual(rows);
  });

  test("addTrackToAlbum inserts pivot and returns row", async () => {
    const row = { album_id: "a", track_id: "t", position: 1, added_at: "now" };
    builder.single.mockResolvedValueOnce({ data: row, error: null });

    const res = await albums.addTrackToAlbum("a", "t", 1);
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(res).toEqual(row);
  });

  test("updateTrackPosition updates pivot and returns row", async () => {
    const row = { album_id: "a", track_id: "t", position: 2, added_at: "now" };
    builder.single.mockResolvedValueOnce({ data: row, error: null });

    const res = await albums.updateTrackPosition("a", "t", 2);
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
    expect(res).toEqual(row);
  });

  test("removeTrackFromAlbum deletes pivot without error", async () => {
    builder.single.mockResolvedValueOnce({ data: null, error: null });

    await expect(
      albums.removeTrackFromAlbum("a", "t"),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("album_tracks");
  });
});
