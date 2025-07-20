// tests/tags.test.js

// 1) Mock the Supabase client
jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const tags = require("../supabase/queries/tags");

describe("tags queries", () => {
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
      single: jest.fn(),
    };

    supabase.from.mockReturnValue(builder);
  });

  test("getTagsByUser returns parsed tags", async () => {
    const fake = [
      {
        id: "t1",
        user_id: "u1",
        name: "Rock",
        category: null,
        created_at: "a",
        updated_at: "b",
      },
      {
        id: "t2",
        user_id: "u1",
        name: "Jazz",
        category: "Genre",
        created_at: "c",
        updated_at: "d",
      },
    ];
    builder.order.mockResolvedValueOnce({ data: fake, error: null });

    const res = await tags.getTagsByUser("u1");
    expect(supabase.from).toHaveBeenCalledWith("tags");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(res).toEqual(fake);
  });

  test("getTagById returns a single tag", async () => {
    const one = {
      id: "t1",
      user_id: "u1",
      name: "Pop",
      category: null,
      created_at: "x",
      updated_at: "y",
    };
    builder.single.mockResolvedValueOnce({ data: one, error: null });

    const res = await tags.getTagById("t1");
    expect(supabase.from).toHaveBeenCalledWith("tags");
    expect(builder.eq).toHaveBeenCalledWith("id", "t1");
    expect(res).toEqual(one);
  });

  test("createTag inserts and returns new tag", async () => {
    const input = { user_id: "u2", name: "EDM", category: null };
    const created = { ...input, id: "t3", created_at: "m", updated_at: "n" };
    builder.single.mockResolvedValueOnce({ data: created, error: null });

    const res = await tags.createTag(input);
    expect(supabase.from).toHaveBeenCalledWith("tags");
    expect(builder.insert).toHaveBeenCalledWith(input);
    expect(res).toEqual(created);
  });

  test("updateTag patches and returns updated tag", async () => {
    const patch = { id: "t4", name: "Chill", category: "Mood" };
    const updated = {
      id: "t4",
      user_id: "u3",
      name: "Chill",
      category: "Mood",
      created_at: "p",
      updated_at: "q",
    };
    builder.single.mockResolvedValueOnce({ data: updated, error: null });

    const res = await tags.updateTag(patch);
    expect(supabase.from).toHaveBeenCalledWith("tags");
    expect(builder.update).toHaveBeenCalledWith({
      name: "Chill",
      category: "Mood",
    });
    expect(builder.eq).toHaveBeenCalledWith("id", "t4");
    expect(res).toEqual(updated);
  });

  test("deleteTag deletes and returns id only", async () => {
    builder.single.mockResolvedValueOnce({ data: { id: "t5" }, error: null });

    const res = await tags.deleteTag("t5");
    expect(supabase.from).toHaveBeenCalledWith("tags");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "t5");
    expect(res).toEqual({ id: "t5" });
  });

  test("addTagToTrack inserts pivot without return", async () => {
    builder.insert.mockResolvedValueOnce({ error: null });
    await expect(tags.addTagToTrack("tid", "tagid")).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("track_tags");
    expect(builder.insert).toHaveBeenCalledWith({
      track_id: "tid",
      tag_id: "tagid",
    });
  });
});
