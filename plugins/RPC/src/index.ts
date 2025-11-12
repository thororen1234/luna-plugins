import { Tracer, type LunaUnload } from "@luna/core";
import { MediaItem, redux } from "@luna/lib";

import { cleanupRPC } from "./discord.native";
import { updateActivity } from "./updateActivity";

export const unloads = new Set<LunaUnload>();
export const { trace, errSignal } = Tracer("[@thororen/rpc]");
export { Settings } from "./Settings";

redux.intercept([
	// Seeking
	"playbackControls/TIME_UPDATE",
	"playbackControls/SEEK",
	"playbackControls/SET_PLAYBACK_STATE",
	// Volume
	"playbackControls/SET_VOLUME",
	"playbackControls/TOGGLE_MUTE",
	"playbackControls/INCREASE_VOLUME",
	"playbackControls/DECREASE_VOLUME",
	"playbackControls/SET_VOLUME_UNMUTE",
], unloads, () => {
	updateActivity()
		.then(() => (errSignal!._ = undefined))
		.catch(trace.err.withContext("Failed to set activity"));
});
unloads.add(MediaItem.onMediaTransition(unloads, updateActivity));
unloads.add(cleanupRPC.bind(cleanupRPC));

setTimeout(updateActivity);

let lastVol: number | undefined = undefined;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const unsub = redux.store.subscribe(() => {
	const state = redux.store.getState();
	const vol = state.playbackControls?.volume;

	if (vol !== lastVol) {
		lastVol = vol;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			updateActivity().catch(trace.err.withContext("Failed to set activity"));
		}, 300);
	}
});

unloads.add(unsub);