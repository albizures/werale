import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html>
			<Head>
				<link
					rel="preload"
					href="https://fonts.cdnfonts.com/s/13435/gabriola Font Download.woff"
					as="font"
					type="font/woff"
					crossOrigin=""
				/>
				<link
					rel="preload"
					href="https://fonts.cdnfonts.com/s/15027/Darleston.woff"
					as="font"
					type="font/woff"
					crossOrigin=""
				/>

				<link
					href="https://fonts.cdnfonts.com/css/gabriola?styles=15410"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.cdnfonts.com/css/darleston"
					rel="stylesheet"
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
