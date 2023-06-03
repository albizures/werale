import '~/styles/globals.css';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Playfair_Display, Lato } from 'next/font/google';

import { type AppType } from 'next/app';
import { api } from '~/utils/api';

const lato = Lato({
	subsets: ['latin'],
	variable: '--font-lato',
	weight: ['100', '300', '400', '700', '900'],
});

const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800', '900'],
	variable: '--font-playfair',
});

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<div
			className={`${playfairDisplay.variable} ${lato.variable} font-mono`}
		>
			<SessionProvider session={session}>
				<Component {...pageProps} />
			</SessionProvider>
		</div>
	);
};

export default api.withTRPC(MyApp);
