export const getLocaleFromPathname = (pathname) =>
	`${pathname.match(/[^/]+?(?=\/|$)/)}`.toLowerCase();
