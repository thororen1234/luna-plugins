import { MediaItem } from "@luna/lib";
import { settings } from "./Settings";

const STR_MAX_LEN = 127;
const DC_STR_MAX_LEN = 22;
export const fmtStr = (s?: string, dc?: boolean) => {
    if (!s) return;
    if (s.length < 2) s += " ";

    if (dc) {
        s = s.replace(/(?:^|\s)([a-z])/g, m => m.toUpperCase());
        return s.length > DC_STR_MAX_LEN
            ? s.slice(0, DC_STR_MAX_LEN - 3) + "..."
            : s;
    }

    return s.length >= STR_MAX_LEN
        ? s.slice(0, STR_MAX_LEN - 3) + "..."
        : s;
};

/** Returns the status line shown in Discord (Listening to ... etc.) */
export const getStatusText = async (mediaItem: MediaItem) => {
    const artistNames = (await MediaItem.artistNames(await mediaItem.artists())) ?? "Unknown Artist";
    const artist = artistNames.join(", ");
    const track = await mediaItem.title();
    const album = (await (await mediaItem.album())?.title()) ?? "";

    let custom = settings.customStatusText || "";
    custom = custom.replaceAll("{artist}", artist).replaceAll("{track}", track).replaceAll("{album}", album);
    return fmtStr(custom);
};