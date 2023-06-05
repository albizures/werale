// You need to fetch the locale and pass it to the page props.
// Unfortunately this cannot be done in a global way.
// This needs to be done for each page you create.

import { type GetStaticProps } from 'next';
import { type Locales } from '~/i18n/i18n-types';
import { loadedLocales } from '~/i18n/i18n-util';
import { loadLocaleAsync } from '~/i18n/i18n-util.async';

// The best option is to create a custom function and use it in getStaticProps.
export const getI18nProps: GetStaticProps = async (context) => {
	const locale = context.locale as Locales;
	await loadLocaleAsync(locale);

	return {
		props: {
			i18n: {
				locale: locale,
				dictionary: loadedLocales[locale],
			},
		},
	};
};

export const getStaticProps = getI18nProps;
