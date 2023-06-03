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
	accept: publicProcedure
		.input(
			z.object({
				id: z.string(),
				acceptedAmount: z.number(),
			}),
		)
		.mutation((args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

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
	decline: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation((args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;

			return prisma.invitation.update({
				where: {
					id: input.id,
				},
				data: {
					status: 'Declined',
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
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.invitation.findMany();
	}),

	getSecretMessage: protectedProcedure.query(() => {
		return 'you can now see this secret message!';
	}),
});
