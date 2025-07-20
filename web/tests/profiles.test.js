// tests/profiles.test.js

// Mock Supabase client
jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const {
  getProfileById,
  createProfile,
  updateProfile,
} = require("../supabase/queries/profiles");

describe("profiles queries (happy path)", () => {
  let builder;

  beforeEach(() => {
    jest.resetAllMocks();

    // chainable builder stub
    builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    supabase.from.mockReturnValue(builder);
  });

  test("getProfileById returns parsed profile", async () => {
    const fake = {
      id: "u1",
      email: "a@b.com",
      name: "Alice",
      dob: null,
      bio: "hi",
      avatar_url: null,
      handle: "alice123",
      created_at: "2025-01-01",
      updated_at: "2025-01-02",
    };
    builder.single.mockResolvedValueOnce({ data: fake, error: null });

    const res = await getProfileById("u1");
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(builder.eq).toHaveBeenCalledWith("id", "u1");
    expect(res).toEqual(fake);
  });

  test("createProfile inserts and returns new profile", async () => {
    const input = {
      id: "u2",
      email: "c@d.com",
      name: "Carol",
      dob: null,
      bio: null,
      avatar_url: null,
      handle: "carol",
    };
    const created = {
      ...input,
      created_at: "2025-01-03",
      updated_at: "2025-01-03",
    };
    builder.single.mockResolvedValueOnce({ data: created, error: null });

    const res = await createProfile(input);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(builder.insert).toHaveBeenCalledWith(input);
    expect(res).toEqual(created);
  });

  test("updateProfile patches and returns updated profile", async () => {
    const patch = {
      id: "u3",
      name: "Dave",
      bio: "updated",
    };
    const updated = {
      id: "u3",
      email: "e@f.com",
      name: "Dave",
      dob: null,
      bio: "updated",
      avatar_url: null,
      handle: "dave",
      created_at: "2025-01-04",
      updated_at: "2025-01-05",
    };
    builder.single.mockResolvedValueOnce({ data: updated, error: null });

    const res = await updateProfile(patch);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Dave",
        bio: "updated",
      }),
    );
    expect(builder.eq).toHaveBeenCalledWith("id", "u3");
    expect(res).toEqual(updated);
  });
});
