import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';

export const eventsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				confirmations: z.array(z.date()),
			}),
		)
		.mutation(async (args) => {
			const { ctx, input } = args;
			const { prisma } = ctx;
			const { name, confirmations } = input;

			return prisma.event.create({
				data: {
					name,
					confirmations: {
						createMany: {
							data: confirmations.map((date) => ({ date })),
						},
					},
				},
			});
		}),
	getAll: protectedProcedure.query(async (args) => {
		const { ctx } = args;
		const { prisma } = ctx;

		return prisma.event.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});
	}),
	getFirst: publicProcedure.query(async (args) => {
		const { ctx } = args;
		const { prisma } = ctx;

		return prisma.event.findFirst({
			orderBy: {
				createdAt: 'desc',
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
			await prisma.event.delete({
				where: {
					id: input.id,
				},
			});
		}),
});
