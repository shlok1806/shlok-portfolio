/*
 * The record crate.
 *
 * Everything here is CC0: public-domain dedications from OpenGameArt, shipped
 * from public/music so the deck never depends on a bucket that might be
 * asleep. CC0 asks for nothing, but the credits block in the audio window
 * names every artist anyway - a record has a sleeve.
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  /** relative to the site root */
  src: string;
  /** licence name, shown in the credits block when set */
  license?: string;
  /** where the recording came from */
  url?: string;
}

export const TRACKS: Track[] = [
  {
    id: "forgotten-path",
    title: "Forgotten Path",
    artist: "johndekale",
    src: "/music/forgotten-path.mp3",
    license: "CC0",
    url: "https://opengameart.org/content/forgotten-path",
  },
  {
    id: "chipscape",
    title: "ChipScape",
    artist: "Chasersgaming",
    src: "/music/chipscape.mp3",
    license: "CC0",
    url: "https://opengameart.org/content/chipscape",
  },
  {
    id: "society-in-ruins",
    title: "Society in Ruins",
    artist: "Spring Spring",
    src: "/music/society-in-ruins.mp3",
    license: "CC0",
    url: "https://opengameart.org/content/society-in-ruins",
  },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
