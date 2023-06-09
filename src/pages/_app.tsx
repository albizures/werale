import 'animate.css';
import '~/styles/globals.css';
import { type Session } from 'next-auth';
import { Montserrat } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import type { Locales, Translation } from '~/i18n/i18n-types';
import { loadedLocales } from '~/i18n/i18n-util';
import { loadFormatters } from '~/i18n/i18n-util.async';
import TypesafeI18n from '~/i18n/i18n-react';

const montserrat = Montserrat({
	variable: '--montserrat',
	subsets: ['latin'],
});

interface Props {
	session: Session | null;
	i18n: {
		locale: Locales;
		dictionary: Translation;
	};
}

const MyApp: AppType<Props> = (props) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = props;

	const content = (
		<div className={`${montserrat.variable}`}>
			<title>Ale 🫶 Werner</title>
			<SessionProvider session={session}>
				<Component {...pageProps} />
			</SessionProvider>
		</div>
	);

	if (!pageProps.i18n) {
		// probably an Error page
		return content;
	}

	const locale: Locales = pageProps.i18n.locale;
	const dictionary: Translation = pageProps.i18n.dictionary;

	loadedLocales[locale] = dictionary;
	loadFormatters(locale);

	return <TypesafeI18n locale={locale}>{content}</TypesafeI18n>;
};

export default api.withTRPC(MyApp);
