import { z } from 'zod';
import { nanoid } from 'nanoid';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';

export const invitationsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				name: z.string(),
				description: z.string().optional().nullish(),
				amount: z.number(),
			}),
		)
		.mutation(async (args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

			let id = nanoid(10);
			while (true) {
				const result = await prisma.invitation.findFirst({
					where: {
						id,
					},
				});
				if (!result) {
					break;
				}

				id = nanoid(11);
			}

			return prisma.invitation.create({
				data: {
					...input,
					id,
				},
			});
		}),
	reply: publicProcedure
		.input(
			z.union([
				z.object({
					id: z.string(),
					acceptedAmount: z.number(),
					status: z.literal('Accepted'),
				}),
				z.object({
					id: z.string(),
					status: z.literal('Declined'),
				}),
			]),
		)
		.mutation((args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

			if (input.status === 'Declined') {
				return prisma.invitation.update({
					where: {
						id: input.id,
					},
					data: {
						replies: {
							create: {
								amount: 0,
								status: 'Declined',
							},
						},
					},
				});
			}

			return prisma.invitation.update({
				where: {
					id: input.id,
				},
				data: {
					replies: {
						create: {
							status: 'Accepted',
							amount: input.acceptedAmount,
						},
					},
				},
			});
		}),

	get: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.query((args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

			return prisma.invitation.findFirstOrThrow({
				where: {
					id: input.id,
				},
				include: {
					replies: {
						orderBy: {
							updatedAt: 'desc',
						},
						take: 1,
					},
					event: {
						include: {
							confirmations: {
								orderBy: {
									date: 'desc',
								},
								where: {
									date: {
										lte: new Date(),
									},
								},
								take: 1,
							},
						},
					},
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
				amount: z.number().optional(),
			}),
		)
		.mutation(async (args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;
			const { id, name, description, amount } = input;

			await prisma.invitation.update({
				where: {
					id,
				},
				data: {
					name,
					description,
					amount,
				},
			});
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async (args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;
			await prisma.invitation.delete({
				where: {
					id: input.id,
				},
			});
		}),
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	getAll: protectedProcedure.query((args) => {
		const { ctx } = args;
		const { prisma } = ctx;
		return prisma.invitation.findMany({
			include: {
				replies: {
					orderBy: {
						updatedAt: 'desc',
					},
					take: 1,
				},
			},
		});
	}),
	getByEvent: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
			}),
		)
		.query((args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

			return prisma.invitation.findMany({
				where: {
					eventId: input.eventId,
				},
				include: {
					replies: {
						orderBy: {
							updatedAt: 'desc',
						},
						take: 1,
					},
				},
			});
		}),

	getSecretMessage: protectedProcedure.query(() => {
		return 'you can now see this secret message!';
	}),
});
