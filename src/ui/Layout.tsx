import { useSession, signIn } from 'next-auth/react';
import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
	children: React.ReactNode;
	isAdmin?: boolean;
}

export function Layout(props: LayoutProps) {
	const { children, isAdmin = false } = props;
	const session = useSession();

	if (!isAdmin) {
		return <>{children}</>;
	}

	console.log('session.status', session.status);

	return (
		<>
			<Loading isLoading={session.status === 'loading'} />
			{session.status === 'authenticated' && (
				<div className="mx-auto max-w-5xl px-2">
					<Navbar />
					{children}
				</div>
			)}
			{session.status === 'unauthenticated' && <Login />}
		</>
	);
}

interface LoadingProps {
	isLoading: boolean;
}

export function Loading(props: LoadingProps) {
	const { isLoading } = props;
	const [waitStatus, setWaitStatus] = React.useState<
		'waiting' | 'done'
	>();

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			setWaitStatus('done');
		}, 1000);

		return () => clearTimeout(timeout);
	}, []);

	if (waitStatus === 'done' && !isLoading) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100">
			<span className="loading loading-infinity loading-lg scale-[3] text-primary"></span>
		</div>
	);
}

export function Login() {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-base-100">
			<div className="card">
				<button
					className="btn-primary btn"
					onClick={() => void signIn('discord')}
				>
					Sign in
				</button>
			</div>
		</div>
	);
}
