import { LunaSelectItem, LunaSelectSetting, LunaSettings, LunaSwitchSetting } from "@luna/ui";

import { ReactiveStore } from "@luna/core";

import React from "react";
import { errSignal, trace } from ".";
import { updateActivity } from "./updateActivity";

export const settings = await ReactiveStore.getPluginStorage("@thororen/rpc", {
	displayOnPause: true,
	displayArtistIcon: true,
	status: "1",
});

export const Settings = () => {
	const [displayOnPause, setDisplayOnPause] = React.useState(settings.displayOnPause);
	const [displayArtistIcon, setDisplayArtistIcon] = React.useState(settings.displayArtistIcon);
	const [status, setStatus] = React.useState(settings.status);

	return (
		<LunaSettings>
			<LunaSwitchSetting
				title="Display activity when paused"
				desc="If disabled, when paused discord wont show the activity"
				tooltip="Display activity"
				// @ts-ignore
				checked={displayOnPause}
				onChange={(_: any, checked: boolean) => {
					setDisplayOnPause((settings.displayOnPause = checked));
					updateActivity()
						.then(() => (errSignal!._ = undefined))
						.catch(trace.err.withContext("Failed to set activity"));
				}}
			/>
			<LunaSwitchSetting
				title="Display artist icon"
				desc="Shows the artist icon in the activity"
				tooltip="Display artist icon"
				// @ts-ignore
				checked={displayArtistIcon}
				onChange={(_: any, checked: boolean) => {
					setDisplayArtistIcon((settings.displayArtistIcon = checked));
					updateActivity()
						.then(() => (errSignal!._ = undefined))
						.catch(trace.err.withContext("Failed to set activity"));
				}}
			/>
			<LunaSelectSetting
				title="Status text"
				desc="What text that you're 'Listening to' in your Discord status."
				value={status}
				onChange={(e: { target: { value: string; }; }) => setStatus((settings.status = e.target.value))}
			>
				<LunaSelectItem value="0" children="Listening to TIDAL" />
				<LunaSelectItem value="1" children="Listening to [Artist Name]" />
				<LunaSelectItem value="2" children="Listening to [Track Name]" />
			</LunaSelectSetting>
		</LunaSettings>
	);
};