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
					status: 'Created',
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
						acceptedAmount: 0,
						status: 'Declined',
					},
				});
			}

			return prisma.invitation.update({
				where: {
					id: input.id,
				},
				data: {
					status: 'Accepted',
					acceptedAmount: input.acceptedAmount,
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

			return prisma.invitation.findUniqueOrThrow({
				where: {
					id: input.id,
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

	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.invitation.findMany();
	}),

	getSecretMessage: protectedProcedure.query(() => {
		return 'you can now see this secret message!';
	}),
});
