/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import type { Invitation } from '@prisma/client';
import {
	type CellContext,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { type inferProcedureInput } from '@trpc/server';
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

export default function Invitations() {
	return (
		<Layout isAdmin={true}>
			<Content />
		</Layout>
	);
}

export function Content() {
	const allQuery = api.invitations.getAll.useQuery();
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
		<div className="font-mono">
			<CreateInvitation />
			<div className="mt-8 overflow-x-auto">
				<table className="table-zebra table">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
											  )}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr className="hover" key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
					<tfoot>
						{table.getFooterGroups().map((footerGroup) => (
							<tr key={footerGroup.id}>
								{footerGroup.headers.map((header) => (
									<th key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.footer,
													header.getContext(),
											  )}
									</th>
								))}
							</tr>
						))}
					</tfoot>
				</table>
				{allQuery.isLoading && (
					<div className="my-10 text-center">
						<span className="loading loading-spinner loading-lg text-primary-focus"></span>
					</div>
				)}
			</div>
		</div>
	);
}

const columnHelper = createColumnHelper<Invitation>();

const index = columnHelper.display({
	id: 'index',
	header() {
		return '#';
	},
	cell(props) {
		return props.row.index + 1;
	},
});
const name = columnHelper.accessor('name', {
	// cell(props) {
	// 	const invitation = props.row.original;
	// 	const a = props.getValue();
	// 	const {} = props;
	// 	return;
	// },
});
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
const status = columnHelper.accessor('status', {});
const acceptedAmount = columnHelper.accessor('acceptedAmount', {
	footer(props) {
		const { table } = props;
		const amount = table
			.getFilteredRowModel()
			.rows.reduce(
				(total, row) => total + row.original.acceptedAmount,
				0,
			);
		return `total: ${amount}`;
	},
});
const actions = columnHelper.display({
	id: 'actions',
	header() {
		return 'Actions';
	},
	cell: (props) => <Actions {...props} />,
});

function downloadURI(name: string, uri: string) {
	const link = document.createElement('a');
	link.download = name;
	link.href = uri;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function Actions(props: CellContext<Invitation, unknown>) {
	const { row } = props;
	const [status, setStatus] = React.useState<'idle' | 'loading'>(
		'idle',
	);
	const utils = api.useContext();
	const invitation = row.original;
	const deleteMutation = api.invitations.delete.useMutation({
		async onSuccess() {
			await utils.invitations.getAll.invalidate();
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

function CreateInvitation() {
	const [status, setStatus] = React.useState<'idle' | 'creating'>(
		'idle',
	);
	const { reset, register, formState, handleSubmit } =
		useForm<NewInvitation>({});
	const context = api.useContext();

	const mutation = api.invitations.create.useMutation({
		async onSuccess() {
			reset();
			await context.invitations.getAll.invalidate();
			setStatus('idle');
		},
	});

	function onSubmit(data: NewInvitation) {
		setStatus('creating');
		mutation.mutate(data);
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
					label="descripcion"
					placeholder="Escribe la description..."
					input={register('description', {
						required: true,
					})}
				/>

				<Field
					label="Cantidad de entradas"
					type="number"
					placeholder="Escribe aqui la cantidad de entradas..."
					input={register('amount', {
						required: true,
						valueAsNumber: true,
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
