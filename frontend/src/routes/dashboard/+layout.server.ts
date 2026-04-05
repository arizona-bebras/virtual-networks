import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
	if (cookies.get('isAuthenticated') !== 'true') {
		throw redirect(302, '/auth');
	}
};
