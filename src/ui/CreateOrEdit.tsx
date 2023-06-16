import type { inferProcedureInput } from '@trpc/server';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { AppRouter } from '~/server/api/root';
import { api } from '~/utils/api';
import { Field } from './Field';
import type { Invitation } from '@prisma/client';

type InvitationInput = inferProcedureInput<
	AppRouter['_def']['procedures']['invitations']['create']
>;

interface CreateOrEditInvitationProps {
	invitation?: Invitation;
	eventId: string;
	onDone?: () => void;
}

export function CreateOrEditInvitation(
	props: CreateOrEditInvitationProps,
) {
	const { eventId, invitation, onDone } = props;
	const [status, setStatus] = React.useState<'idle' | 'creating'>(
		'idle',
	);
	const { reset, register, formState, handleSubmit } =
		useForm<InvitationInput>({
			defaultValues: invitation
				? {
						amount: invitation.amount,
						name: invitation.name,
						description: invitation.description,
				  }
				: {},
		});
	const context = api.useContext();

	const update = api.invitations.update.useMutation({
		onSettled() {
			setStatus('idle');
			onDone && onDone();
		},
		async onSuccess() {
			reset();
			await context.invitations.getByEvent.invalidate();
		},
	});
	const create = api.invitations.create.useMutation({
		onSettled() {
			setStatus('idle');
			onDone && onDone();
		},
		async onSuccess() {
			reset();
			await context.invitations.getByEvent.invalidate();
		},
	});

	function onSubmit(data: InvitationInput) {
		setStatus('creating');

		if (invitation) {
			update.mutate({
				description: data.description ?? undefined,
				name: data.name ?? undefined,
				amount: data.amount ?? undefined,
				id: invitation.id,
			});
		} else {
			create.mutate({
				...data,
				eventId,
			});
		}
	}

	return (
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="grid grid-cols-3 gap-2">
				<Field
					label="Nombre"
					placeholder="Escribe el nombre de la invitation..."
					input={register('name', {
						required: true,
					})}
				/>
				<Field
					label="Cantidad de entradas"
					type="number"
					placeholder="Escribe aqui la cantidad de entradas..."
					input={register('amount', {
						required: true,
						min: 1,
						valueAsNumber: true,
					})}
				/>

				<Field
					label="descripcion"
					placeholder="Escribe la description..."
					input={register('description', {
						required: false,
					})}
				/>
			</div>
			<div className="mt-4 flex justify-center">
				<button
					disabled={!formState.isValid || status === 'creating'}
					className="btn-primary btn-block btn max-w-sm"
				>
					{status === 'creating' ? (
						<span className="loading loading-spinner"></span>
					) : (
						<span>{invitation ? 'Actualizar' : 'Crear'}</span>
					)}
				</button>
			</div>
		</form>
	);
}
