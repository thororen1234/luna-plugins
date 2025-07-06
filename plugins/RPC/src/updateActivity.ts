import { asyncDebounce } from "@inrixia/helpers";
import { MediaItem, PlayState, redux } from "@luna/lib";

import type { SetActivity } from "@xhayper/discord-rpc";
import { setActivity } from "./discord.native";
import { settings } from "./Settings";

const STR_MAX_LEN = 127;
const fmtStr = (s?: string) => {
	if (!s) return;
	if (s.length < 2) s += " ";
	return s.length >= STR_MAX_LEN ? s.slice(0, STR_MAX_LEN - 3) + "..." : s;
};
const toTitleCase = (str: string) => {
	return str.replace(/\w\S*/g, txt => {
		return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
	})
};

export const updateActivity = asyncDebounce(async (mediaItem?: MediaItem) => {
	if (!PlayState.playing && !settings.displayOnPause) return await setActivity();

	mediaItem ??= await MediaItem.fromPlaybackContext();
	if (mediaItem === undefined) return;

	const activity: SetActivity = { type: 2 }; // Listening type
	const { sourceName, sourceUrl } = redux.store.getState().playQueue;

	activity.buttons = [
		{
			url: `https://tidal.com/browse/${mediaItem.tidalItem.contentType}/${mediaItem.id}?u`,
			label: "Play Song",
		},
		{
			url: `https://desktop.tidal.com/browse/${sourceUrl}`,
			label: `Playing From: ${toTitleCase(fmtStr(sourceName) ?? "Unknown")}`,
		}
	];

	// Title
	activity.details = await mediaItem.title().then(fmtStr);
	// Artists
	const artistNames = await MediaItem.artistNames(await mediaItem.artists());
	activity.state = fmtStr(artistNames.join(", ")) ?? "Unknown Artist";

	// Pause indicator
	if (PlayState.playing) {
		// Small Artist image
		if (settings.displayArtistIcon) {
			const artist = await mediaItem.artist();
			activity.smallImageKey = artist?.coverUrl("320");
			activity.smallImageText = fmtStr(artist?.name);
		}

		// Playback/Time
		if (mediaItem.duration !== undefined) {
			activity.startTimestamp = Date.now() - PlayState.playTime * 1000;
			activity.endTimestamp = activity.startTimestamp + mediaItem.duration * 1000;
		}
	} else {
		activity.smallImageKey = "paused-icon";
		activity.smallImageText = "Paused";
		activity.endTimestamp = Date.now();
	}

	// Album
	const album = await mediaItem.album();
	if (album) {
		activity.largeImageKey = album.coverUrl();
		activity.largeImageText = await album.title().then(fmtStr);
	}

	await setActivity(activity);
}, true);
