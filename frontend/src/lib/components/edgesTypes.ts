export type ClientToSwitchData = {
	connectionType: 'client-switch';
	data: {
		speed: number;
	};
};

export type SwitchToServerData = {
	connectionType: 'switch-server';
	data: {
		status: string;
	};
};
