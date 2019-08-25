import { writable } from 'svelte/store';

function createSysMesgs() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		addmsg: (msg) => update(msgs => {
            return msgs.concat([msg]);
        }),
		reset: (msgs=[]) => set(msgs)
	};
}

export const sysmessages = createSysMesgs();