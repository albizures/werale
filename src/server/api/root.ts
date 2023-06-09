import { invitationsRouter } from '~/server/api/routers/invitations';
import { createTRPCRouter } from '~/server/api/trpc';
import { eventsRouter } from './routers/events';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	invitations: invitationsRouter,
	events: eventsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
