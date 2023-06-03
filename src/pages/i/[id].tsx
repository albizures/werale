import { z } from 'zod';
import React from 'react';
import { useRouter } from 'next/router';
import { BiSad, BiHappy, BiX } from 'react-icons/bi';
import { Loading } from '~/ui/Layout';
import { api } from '~/utils/api';
import { CounterDownDate } from '~/ui/Coutdown';

const querySchema = z.object({
	id: z.string(),
});

type Status = 'idle' | 'accepted' | 'accepting' | 'declined';

export default function InvitationView() {
	const router = useRouter();
	const query = querySchema.safeParse(router.query);

	if (!query.success) {
		return null;
	}

	const { id } = query.data;

	return <Content id={id} />;
}

interface ContentProps {
	id: string;
}

function Content(props: ContentProps) {
	const accept = api.invitations.accept.useMutation();
	const decline = api.invitations.decline.useMutation();
	const [status, setStatus] = React.useState<Status>('idle');
	const { id } = props;

	const invitation = api.invitations.get.useQuery(
		{
			id: String(id),
		},
		{
			enabled: !!id,
		},
	);

	function onAccepting() {
		setStatus('accepting');
	}

	function onAccept(acceptedAmount: number) {
		accept.mutate({
			id,
			acceptedAmount,
		});
	}

	function onDecline() {
		decline.mutate({
			id,
		});
	}

	return (
		<>
			<Loading isLoading={invitation.isLoading} />
			<div className="mt-4 px-2">
				<div className="mx-auto max-w-2xl">
					<div className="">
						<h1 className="flex flex-col items-center font-serif text-7xl font-semibold text-secondary-focus">
							<span>Ale</span>
							<span className="text-4xl">&</span>
							<span>Werner</span>
						</h1>

						<p className="mt-4 text-center">
							Estas cordialmente invitado a la celebracion de nuestra
							boda
						</p>
						<h2 className="mt-8 text-center font-sans text-2xl font-bold uppercase text-primary">
							Ya falta poco
						</h2>
						<div className="mt-4 flex justify-center">
							<CounterDownDate />
						</div>
						<h2 className="mt-8 text-center font-sans text-2xl font-bold uppercase text-primary">
							Confirmanos si podras ir
						</h2>
						<div className="mt-4 flex justify-around">
							<div className="text-center">
								<button
									onClick={onAccepting}
									className="inline-flex flex-col items-center text-6xl text-success"
								>
									<BiHappy />
									<span className="text-lg">Asistire</span>
								</button>
							</div>
							<div className="text-center">
								<button
									onClick={onDecline}
									className="inline-flex flex-col items-center text-6xl text-error"
								>
									<BiSad />
									<span className="text-lg">No podre asistir</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{status === 'accepting' && (
				<div className="fixed inset-0 flex items-center justify-center px-8 backdrop-blur-sm">
					<div className="rounded-lg border bg-base-100 p-4 shadow">
						<div className="flex items-center justify-center gap-3">
							<h3 className="font-sans text-3xl font-bold text-primary">
								Cuantos iran?
							</h3>
							<div>
								<button className="text-3xl text-base-300 ">
									<BiX />
								</button>
							</div>
						</div>
						<div className="flex justify-center">
							<div className="join join-horizontal mt-4">
								{Array(invitation.data?.amount)
									.fill(0)
									.map((_, index) => {
										return (
											<button
												onClick={() => onAccept(index + 1)}
												key={index}
												className="btn-neutral join-item btn"
											>
												{index + 1}
											</button>
										);
									})}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
