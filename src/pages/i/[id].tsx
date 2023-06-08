import { z } from 'zod';
import React from 'react';
import { useRouter } from 'next/router';
import { BiSad, BiHappy, BiX } from 'react-icons/bi';
import { useI18nContext } from '~/i18n/i18n-react';
import { Loading } from '~/ui/Layout';
import { api } from '~/utils/api';
import { CounterDownDate } from '~/ui/Countdown';
import { type Invitation } from '@prisma/client';
import { getI18nProps } from '~/utils/i18n';
import { prisma } from '~/server/db';
import clsx from 'clsx';

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
	const { id } = props;

	const invitation = api.invitations.get.useQuery(
		{
			id: String(id),
		},
		{
			enabled: !!id,
		},
	);

	return (
		<>
			<Loading isLoading={invitation.isLoading} />
			{invitation.data && (
				<InvitationContent invitation={invitation.data} />
			)}
		</>
	);
}

interface InvitationContentProps {
	invitation: Invitation;
}

function InvitationContent(props: InvitationContentProps) {
	const { invitation } = props;
	const reply = api.invitations.reply.useMutation();
	const [status, setStatus] = React.useState<Status>('idle');
	const { LL } = useI18nContext();

	const { id, amount } = invitation;

	function onAccept(acceptedAmount: number) {
		reply.mutate({
			id,
			status: 'Accepted',
			acceptedAmount,
		});
	}

	function onDecline() {
		reply.mutate({
			id,
			status: 'Declined',
		});
	}

	function onReplyCancel() {
		setStatus('idle');
	}

	function onAccepting() {
		setStatus('accepting');
	}

	const onScreen = useAnimateOnScreen();

	return (
		<div className="fixed inset-0 mx-auto max-w-2xl overflow-y-auto shadow md:my-4 md:rounded">
			<div className="pattern-bg sticky top-0 h-full bg-repeat" />
			<div className="absolute top-0 w-full">
				<div className="border-y-1 mt-8 border-base-200 bg-base-100 px-4 py-8 shadow-inner">
					<h1
						ref={onScreen}
						data-animate="zoomIn"
						className="animate__animated flex flex-col items-center bg-white px-10 font-serif text-8xl text-primary-focus"
					>
						<span className="-translate-x-8">Alejandra</span>
						<span className="translate-x-4 scale-[2] text-4xl text-secondary-focus">
							&
						</span>
						<span className="translate-x-14">Werner</span>
					</h1>

					<p className="mt-4 text-center text-3xl">
						{LL.inviteMessage(amount)}
					</p>
				</div>

				<div className="border-y-1 mt-8 border-base-200 bg-base-100">
					<div className="space-y-4">
						<Place
							title={LL.church.title()}
							description={LL.church.description()}
							parking={LL.church.parking()}
							footer={LL.church.footer()}
							link="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7720.14803473098!2d-90.50442085396084!3d14.651739723334886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgt!4v1686015510383!5m2!1sen!2sgt"
						/>
						<Place
							isReversed={true}
							title={LL.church.title()}
							description={LL.church.description()}
							parking={LL.church.parking()}
							footer={LL.church.footer()}
							link="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7720.14803473098!2d-90.50442085396084!3d14.651739723334886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgt!4v1686015510383!5m2!1sen!2sgt"
						/>
					</div>

					<div className="bg-base-100 px-4 py-6">
						<h2 className="text-center font-sans text-2xl font-bold uppercase text-primary">
							Ya falta poco
						</h2>
						<div className="mt-4 flex justify-center">
							<CounterDownDate />
						</div>
					</div>
				</div>

				<div className="py-8">
					<div className="border-y-1 border-base-200 bg-base-100 px-4 py-8 shadow-inner">
						<h2 className="text-center font-sans text-2xl font-bold uppercase text-primary">
							{LL.confirmPlease(amount)}
						</h2>
						<div className="mt-4 flex justify-around">
							<div className="text-center">
								<button
									onClick={onAccepting}
									className="inline-flex flex-col items-center text-6xl text-success"
								>
									<BiHappy />
									<span className="text-lg">
										{LL.acceptInvitation(amount)}
									</span>
								</button>
							</div>
							<div className="text-center">
								<button
									onClick={onDecline}
									className="inline-flex flex-col items-center text-6xl text-error"
								>
									<BiSad />
									<span className="text-lg">
										{LL.declineInvitation(amount)}
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{status === 'accepting' && (
				<div className="fixed inset-0 flex items-center justify-center px-8 backdrop-blur-sm">
					<button
						className="absolute inset-0 z-0"
						onClick={onReplyCancel}
					></button>
					<div className="relative z-10 rounded-lg border bg-base-100 p-4 shadow">
						<div className="flex items-center justify-center gap-3">
							<h3 className="font-sans text-3xl font-bold text-primary">
								Cuantos iran?
							</h3>
							<div>
								<button
									onClick={onReplyCancel}
									className="text-3xl text-base-300 "
								>
									<BiX />
								</button>
							</div>
						</div>
						<div className="flex justify-center">
							<div className="join join-horizontal mt-4">
								{Array(amount)
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
		</div>
	);

	/* <iframe
		src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7720.14803473098!2d-90.50442085396084!3d14.651739723334886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sgt!4v1686015510383!5m2!1sen!2sgt"
		className="border-0"
		width="600"
		height="450"
		allowFullScreen={false}
		loading="lazy"
		referrerPolicy="no-referrer-when-downgrade"
	></iframe> */
}

export async function getStaticPaths() {
	const invitations = await prisma.invitation.findMany({
		where: {},
		select: {
			id: true,
		},
	});

	return {
		paths: invitations.map((params) => ({ params })),
		fallback: true,
	};
}

export const getStaticProps = getI18nProps;

function useAnimateOnScreen() {
	return React.useCallback((element: HTMLDivElement) => {
		console.log('ekene', element);

		if (!element) {
			return;
		}

		const type = element.dataset.animate;

		if (!type) {
			return;
		}

		const className = `animate__${type}`;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry && !entry.isIntersecting) {
					return;
				}
				element.classList.add(className);
				observer.disconnect();
			},
			{
				// threshold,
			},
		);
		observer.observe(element);
	}, []);
}

interface PlaceProps {
	title: string;
	description: string;
	parking: string;
	footer: string;
	link: string;
	isReversed?: boolean;
}

function Place(props: PlaceProps) {
	const {
		title,
		description,
		parking,
		footer,
		link,
		isReversed = false,
	} = props;
	return (
		<div
			className={clsx('bg-base-100 md:flex', {
				'flex-row-reverse': isReversed,
			})}
		>
			<div className="flex-1 space-y-3 p-4 text-center">
				<h3 className="text-2xl font-bold text-primary-focus">
					{title}
				</h3>
				<p className="text-xl">{description}</p>
				<p className="text-xl">{parking}</p>
				<p className="text-xl">{footer}</p>
			</div>
			<div className="m-4 flex-1">
				<div className="wrapper">
					<iframe
						src={link}
						className="border-0"
						width="600"
						height="450"
						allowFullScreen={false}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					/>
				</div>
			</div>
		</div>
	);
}
