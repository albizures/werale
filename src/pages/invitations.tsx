/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import {
	type CellContext,
	createColumnHelper,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { downloadURI } from 'only-fns/files/downloadURI';
import type {
	inferProcedureOutput,
	inferProcedureInput,
} from '@trpc/server';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { BiCopy, BiEdit, BiTrash } from 'react-icons/bi';
import { AiOutlineQrcode } from 'react-icons/ai';
import { useCopyToClipboard } from 'react-use';
import { type AppRouter } from '~/server/api/root';
import { Field } from '~/ui/Field';
import { Layout } from '~/ui/Layout';
import { api } from '~/utils/api';
import QRCode from 'qrcode';
import { Table } from '~/ui/Table';

export default function Invitations() {
	const event = api.events.getFirst.useQuery();
	const allQuery = api.invitations.getByEvent.useQuery(
		{
			eventId: event.data?.id ?? '',
		},
		{
			enabled: event.isFetched,
		},
	);

	const table = useReactTable({
		getCoreRowModel: getCoreRowModel(),
		columns: [
			index,
			name,
			description,
			amount,
			status,
			acceptedAmount,
			actions,
		],
		data: allQuery.data ?? [],
	});
	return (
		<Layout isAdmin={true}>
			<div className="font-mono">
				<CreateInvitation eventId={event.data?.id ?? ''} />
				<div className="mt-8 overflow-x-auto">
					<Table table={table} />
					{allQuery.isLoading && (
						<div className="my-10 text-center">
							<span className="loading loading-spinner loading-lg text-primary-focus"></span>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}

type TableType = inferProcedureOutput<
	AppRouter['_def']['procedures']['invitations']['getAll']
>[number];

const columnHelper = createColumnHelper<TableType>();

const index = columnHelper.display({
	id: 'index',
	header() {
		return '#';
	},
	cell(props) {
		return props.row.index + 1;
	},
});
const name = columnHelper.accessor('name', {});
const description = columnHelper.accessor('description', {});
const amount = columnHelper.accessor('amount', {
	footer(props) {
		const { table } = props;
		const amount = table
			.getFilteredRowModel()
			.rows.reduce((total, row) => total + row.original.amount, 0);
		return `total: ${amount}`;
	},
});
const status = columnHelper.display({
	id: 'status',
	header() {
		return 'Status';
	},
	cell(props) {
		const { original: invitation } = props.row;

		const reply = invitation.replies[0];

		if (!reply) {
			return <div>waiting</div>;
		}

		return <div>{reply.status}</div>;
	},
});
const acceptedAmount = columnHelper.display({
	footer(props) {
		const { table } = props;
		const amount = table
			.getFilteredRowModel()
			.rows.reduce((total, row) => {
				const { original: invitation } = row;

				const reply = invitation.replies[0];

				if (!reply) {
					return total;
				}

				return total + reply.amount;
			}, 0);
		return `total: ${amount}`;
	},
	id: 'acceptedAmount',
	header() {
		return 'Aceptadas';
	},
	cell(props) {
		const { original: invitation } = props.row;
		const reply = invitation.replies[0];
		if (!reply) {
			return <div>0</div>;
		}

		return <div>{reply.amount}</div>;
	},
});
const actions = columnHelper.display({
	id: 'actions',
	header() {
		return 'Actions';
	},
	cell: (props) => <Actions {...props} />,
});

function Actions(props: CellContext<TableType, unknown>) {
	const { row } = props;
	const [status, setStatus] = React.useState<'idle' | 'loading'>(
		'idle',
	);
	const utils = api.useContext();
	const invitation = row.original;
	const deleteMutation = api.invitations.delete.useMutation({
		async onSuccess() {
			await utils.invitations.getByEvent.invalidate();
		},
		onSettled() {
			setStatus('idle');
		},
	});
	const link = `${location.origin}/i/${invitation.id}`;
	const [state, copyToClipboard] = useCopyToClipboard();

	function onCopy() {
		copyToClipboard(link);
	}

	async function onQRCode() {
		downloadURI(
			`qr-${invitation.name}.png`,
			await QRCode.toDataURL(link),
		);
	}

	function onDelete() {
		if (confirm('Esta seguro de eliminar?')) {
			setStatus('loading');
			deleteMutation.mutate({
				id: invitation.id,
			});
		}
	}
	if (status === 'loading') {
		return (
			<div className="flex w-full items-center justify-center">
				<span className="loading loading-dots loading-md text-primary-focus"></span>
			</div>
		);
	}

	return (
		<div className="flex w-full items-center">
			<Link href={link} target="_blank" className="btn-link btn">
				link
			</Link>
			<div className="flex flex-1 space-x-2">
				<button
					onClick={onCopy}
					className={clsx('text-lg', {
						'text-primary-focus': !state.value,
						'text-success': state.value,
					})}
				>
					<BiCopy />
				</button>

				<button
					onClick={onQRCode}
					className="text-lg text-primary-focus"
				>
					<AiOutlineQrcode />
				</button>
				<button className="text-lg text-primary-focus">
					<BiEdit />
				</button>
				<button onClick={onDelete} className="text-lg text-error">
					<BiTrash />
				</button>
			</div>
		</div>
	);
}

type NewInvitation = inferProcedureInput<
	AppRouter['_def']['procedures']['invitations']['create']
>;

interface CreateInvitationProps {
	eventId: string;
}

function CreateInvitation(props: CreateInvitationProps) {
	const { eventId } = props;
	const [status, setStatus] = React.useState<'idle' | 'creating'>(
		'idle',
	);
	const { reset, register, formState, handleSubmit } =
		useForm<NewInvitation>({});
	const context = api.useContext();

	const mutation = api.invitations.create.useMutation({
		onSettled() {
			setStatus('idle');
		},
		async onSuccess() {
			reset();
			await context.invitations.getByEvent.invalidate();
		},
	});

	function onSubmit(data: NewInvitation) {
		setStatus('creating');
		mutation.mutate({
			...data,
			eventId,
		});
	}

	return (
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
						<span>Crear</span>
					)}
				</button>
			</div>
		</form>
	);
}
