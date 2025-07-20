// Profiles
export {
  getProfileById,
  createProfile,
  updateProfile,
  type Profile,
  type CreateProfileInput,
  type UpdateProfileInput,
} from "./profiles";

// Albums
export {
  getAlbumsByUser,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  type Album,
  type CreateAlbumInput,
  type UpdateAlbumInput,
} from "./albums";

// Tracks
export {
  getTracksByUser,
  getTrackById,
  getTracksByAlbum,
  createTrack,
  updateTrack,
  deleteTrack,
  type Track,
  type CreateTrackInput,
  type UpdateTrackInput,
} from "./tracks";

// Tags
export {
  getTagsByUser,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagsForTrack,
  addTagToTrack,
  removeTagFromTrack,
  type Tag,
  type CreateTagInput,
  type UpdateTagInput,
} from "./tags";

// Album ↔ Track pivot (renamed exports so they don't collide with the ones in albums.ts)
export {
  getTracksInAlbum as getAlbumTracks,
  addTrackToAlbum as addAlbumTrack,
  removeTrackFromAlbum as removeAlbumTrack,
  updateTrackPosition as updateAlbumTrackPosition,
  batchUpdatePositions as batchUpdateAlbumPositions,
  type AlbumTrack,
} from "./albumTracks";
