import { z } from 'zod';
import React from 'react';
import { useRouter } from 'next/router';
import { BiSad, BiHappy, BiX } from 'react-icons/bi';
import { useI18nContext } from '~/i18n/i18n-react';
import { Loading } from '~/ui/Layout';
import { api } from '~/utils/api';
import { CounterDownDate } from '~/ui/Countdown';
import type { Reply, Invitation, Confirmation } from '@prisma/client';
import { getI18nProps } from '~/utils/i18n';
import { prisma } from '~/server/db';
import clsx from 'clsx';
import { FaWaze } from 'react-icons/fa';

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
				<InvitationContent
					reply={invitation.data.replies[0]}
					invitation={invitation.data}
					confirmation={invitation.data.event.confirmations[0]}
				/>
			)}
		</>
	);
}

interface InvitationContentProps {
	invitation: Invitation;
	reply?: Reply;
	confirmation?: Confirmation;
}

function isBeforeConfirmation(
	reply?: Reply,
	confirmation?: Confirmation,
): boolean {
	return Boolean(
		reply && confirmation && confirmation.date > reply.createdAt,
	);
}

function InvitationContent(props: InvitationContentProps) {
	const { invitation, reply, confirmation } = props;
	const replyMutation = api.invitations.reply.useMutation();
	const [status, setStatus] = React.useState<Status>('idle');
	const { LL } = useI18nContext();

	const { id, amount, name } = invitation;

	const isDeclined = status === 'declined';
	const isAccepted = status === 'accepted';
	const replyIsDeclined = Boolean(
		reply && reply.status === 'Declined',
	);
	const replyIsAccepted = Boolean(
		reply && reply.status === 'Accepted',
	);

	const wasNowReplied = isAccepted || isDeclined;
	const wasBeforeReplied =
		!isBeforeConfirmation(reply, confirmation) &&
		(replyIsAccepted || replyIsDeclined);
	const wasReplied = wasNowReplied || wasBeforeReplied;

	const wasAccepted =
		isAccepted ||
		(!isBeforeConfirmation(reply, confirmation) && replyIsAccepted);
	const wasDeclined =
		isDeclined ||
		(!isBeforeConfirmation(reply, confirmation) && replyIsDeclined);

	function onAccept(acceptedAmount: number) {
		replyMutation.mutate(
			{
				id,
				status: 'Accepted',
				acceptedAmount,
			},
			{
				onSuccess() {
					setStatus('accepted');
				},
			},
		);
	}

	function onDecline() {
		replyMutation.mutate(
			{
				id,
				status: 'Declined',
			},
			{
				onSuccess() {
					setStatus('declined');
				},
			},
		);
	}

	function onReplyCancel() {
		setStatus('idle');
	}

	function onAccepting() {
		if (amount === 1) {
			replyMutation.mutate({
				id,
				status: 'Accepted',
				acceptedAmount: 1,
			}, 	{
				onSuccess() {
					setStatus('accepted');
				},
			},);
		} else {
			setStatus('accepting');
		}
	}

	const onScreen = useAnimateOnScreen();

	return (
		<div className="fixed inset-0 mx-auto max-w-2xl overflow-y-auto shadow md:my-4 md:rounded">
			<div className="pattern-bg sticky top-0 h-full bg-repeat" />
			<div className="absolute top-0 w-full">
				<div className="border-y-1 mt-8 border-base-200 bg-base-100 bg-opacity-70 px-4 py-8 shadow-inner">
					<h1
						ref={onScreen}
						data-animate="zoomIn"
						className="animate__animated flex flex-col items-center px-10 font-serif text-8xl text-olive delay-75"
					>
						<span className="-translate-x-8">Alejandra</span>
						<span className="translate-x-4 scale-[2] text-4xl text-secondary-focus">
							&
						</span>
						<span className="translate-x-14">Werner</span>
					</h1>

					<p className="mt-4 text-center text-3xl">
						{LL.inviteMessage({ name, amount })}
					</p>
				</div>

				<div className="border-y-1 mt-8 border-base-200 bg-base-100 bg-opacity-70">
					<div className="space-y-4">
						<Place
							title={LL.church.title()}
							description={LL.church.description()}
							parking={LL.church.parking()}
							footer={LL.church.footer()}
							link="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15442.067426354592!2d-90.5606623!3d14.626577!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a1b3a657661b%3A0x4861d1e8322d7ce0!2sParroquia%20El%20Divino%20Redentor!5e0!3m2!1sen!2sgt!4v1686190105648!5m2!1sen!2sgt"
							waze="https://waze.com/ul/h9fxe5nz36"
						/>

						<Place
							isReversed={true}
							title={LL.reception.title()}
							description={LL.reception.description()}
							parking={LL.reception.parking()}
							footer={LL.reception.footer()}
							link="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15449.365332216232!2d-90.598158!3d14.522458!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a77eeb4169d1%3A0xf2f84ba6b9b5f6b!2sAmnery&#39;s%20Castle!5e0!3m2!1sen!2sgt!4v1686192388467!5m2!1sen!2sgt"
							waze="https://waze.com/ul/h9fxdd7sxd"
						/>
					</div>
				</div>

				<div className="py-8">
					<div className="border-y-1 border-base-200 bg-base-100 bg-opacity-70 px-4 shadow-inner">
						{!wasReplied && (
							<>
								<h2 className="pt-8 text-center font-sans text-2xl font-bold uppercase text-primary">
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
							</>
						)}

						<div className="px-4 py-6">
							<h2 className="text-center font-sans text-2xl font-bold uppercase text-primary-focus">
								{wasAccepted ? (
									<>
										Es un gusto saber que nos acompañaras, prepara tu
										traje o vestido que nos vemos en:
									</>
								) : wasDeclined ? (
									<>
										Será una pena no contar con tu asistencia, gracias
										por confirmar
									</>
								) : (
									<>Ya falta poco</>
								)}
							</h2>

							{!wasDeclined && (
								<div className="mt-4 flex justify-center">
									<CounterDownDate />
								</div>
							)}
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
												className="btn-neutral btn-md join-item btn text-2xl"
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
	waze: string;
	isReversed?: boolean;
}

function Place(props: PlaceProps) {
	const {
		title,
		description,
		parking,
		footer,
		link,
		waze,
		isReversed = false,
	} = props;
	return (
		<div
			className={clsx('bg-opacity-70 md:flex', {
				'flex-row-reverse': isReversed,
			})}
		>
			<div className="flex-1 space-y-4 p-4 text-center">
				<h3 className="text-2xl font-bold text-primary-focus">
					{title}
				</h3>
				<p className="text-xl leading-5">{description}</p>
				<p className="text-xl leading-5">{parking}</p>
				<p className="text-xl leading-5">{footer}</p>
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
				<p className="py-1 text-center">
					<a
						className="text-2xl text-primary-focus underline hover:text-secondary-focus"
						href={waze}
					>
						<FaWaze className="mr-1 inline-block" />
						waze
					</a>
				</p>
			</div>
		</div>
	);
}
