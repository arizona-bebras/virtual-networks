import { redirect } from '@sveltejs/kit';


export const load = () => {
	if (localStorage.getItem('token') === null) {
		throw redirect(302, '/auth/login');
	}
};
