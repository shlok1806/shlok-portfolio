/**
 * The playlist.
 *
 * Every entry is an audio file served from /public/music, and adding one is two
 * steps with no code: drop the file in, add a line below. Nothing is fetched
 * until the visitor presses play - the element is created on demand and set to
 * preload="none" - so a playlist of any size costs a visitor who never touches
 * it nothing at all.
 *
 * On licensing, because it decides what is safe to put in this list. Music that
 * can be published without asking anyone comes in two forms, and the difference
 * shows up in the player:
 *
 *   CC0 / public domain - nothing required beyond the file.
 *
 *   CC-BY - the credit has to reach the listener, not sit in a source comment.
 *   Fill in `license` and `url` and the player window renders the attribution.
 *
 * Sources that can be filtered to those two: Pixabay Music, the Free Music
 * Archive, OpenGameArt, and Incompetech (CC-BY, so it needs the credit fields).
 * Commercial recordings are neither, and this site is public - sitemap, robots
 * and all - so anything in here is being published, not just played locally.
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  /** path under /public, e.g. "/music/lamp.mp3" */
  src: string;
  /** e.g. "CC0" or "CC BY 4.0"; shown in the player window when set */
  license?: string;
  /** where the track came from, so the credit can be checked */
  url?: string;
}

/*
 * Empty until the music is chosen. The player handles this state deliberately -
 * the panel widget sits there inert rather than breaking, and the window says
 * what to do about it - so the desktop can ship before the playlist does.
 *
 * Order matters: the first entry is what the deck is cued to on load.
 *
 * The shape of an entry, for when there is one:
 *
 *   {
 *     id: "lamp",
 *     title: "Lamplight",
 *     artist: "Some One",
 *     src: "/music/lamp.mp3",
 *     license: "CC BY 4.0",
 *     url: "https://example.com/lamplight",
 *   }
 */
/*
 * Served from Supabase Storage rather than /public, so an hour of synthwave is
 * not in the git history and not in every Vercel deploy. Two things this depends
 * on, both easy to break silently:
 *
 *   The bucket is public and answers with access-control-allow-origin: *, which
 *   is what lets the panel's analyser read the samples. lib/music/player.ts sets
 *   crossOrigin before src for the same reason - without either half the record
 *   still plays and the meter sits flat.
 *
 *   The project is on the free plan, so it pauses after a week of no traffic and
 *   takes Storage with it. The player already treats a failed load as an error
 *   state rather than a crash, so a paused project costs the visitor the music
 *   and nothing else.
 *
 * The %20s are the upload's own filename. Renaming the object means re-uploading
 * it, which is not worth doing to tidy a string.
 */
const SUPABASE_MUSIC =
  "https://yffkynlswlcgsoyomqtj.supabase.co/storage/v1/object/public/music";

export const TRACKS: Track[] = [
  {
    id: "back-to-the-80s",
    title: "Back To The 80's",
    artist: "Marvel83' - synthwave mix",
    src: `${SUPABASE_MUSIC}/Back%20To%20The%2080s%20Marvel83%20Edition%20Best%20of%20Synthwave%20And%20Retro%20Electro%20Music%20Mix.mp3`,
  },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
