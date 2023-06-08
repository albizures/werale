import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html>
			<Head>
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
