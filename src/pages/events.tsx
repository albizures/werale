import {
	type CellContext,
	createColumnHelper,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import type {
	inferProcedureInput,
	inferProcedureOutput,
} from '@trpc/server';
import format from 'date-fns/format';
import React from 'react';
import { useForm } from 'react-hook-form';
import { BiEdit, BiTrash } from 'react-icons/bi';
import type { AppRouter } from '~/server/api/root';
import { Field } from '~/ui/Field';
import { Layout } from '~/ui/Layout';
import { Table } from '~/ui/Table';
import { api } from '~/utils/api';

type TableType = inferProcedureOutput<
	AppRouter['_def']['procedures']['events']['getAll']
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

const actions = columnHelper.display({
	id: 'actions',
	header() {
		return 'Actions';
	},
	cell: (props) => <Actions {...props} />,
});

export default function Events() {
	const allQuery = api.events.getAll.useQuery();
	const table = useReactTable({
		getCoreRowModel: getCoreRowModel(),
		columns: [index, name, actions],
		data: allQuery.data ?? [],
	});

	return (
		<Layout isAdmin={true}>
			<div className="font-mono">
				<CreateEvent />
				<div className="mt-8 overflow-x-auto">
					<Table table={table} />
				</div>
			</div>
		</Layout>
	);
}

type NewEvent = inferProcedureInput<
	AppRouter['_def']['procedures']['events']['create']
> & {
	amount: number;
};

function CreateEvent() {
	const [status, setStatus] = React.useState<'idle' | 'creating'>(
		'idle',
	);
	const { reset, register, formState, handleSubmit, watch } =
		useForm<NewEvent>({
			defaultValues: {
				amount: 0,
			},
		});
	const context = api.useContext();

	const mutation = api.events.create.useMutation({
		onSettled() {
			setStatus('idle');
		},
		async onSuccess() {
			reset();
			await context.events.getAll.invalidate();
		},
	});

	function onSubmit(data: NewEvent) {
		setStatus('creating');

		mutation.mutate(data);
	}

	const amount = watch('amount');

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
					label="Cantidad de confirmaciones"
					type="number"
					placeholder="Escribe aqui la cantidad de confirmaciones..."
					input={register('amount', {
						setValueAs: (date: Date) => format(date, 'yyyy-MM-dd'),
						required: true,
						min: 1,
						valueAsNumber: true,
					})}
				/>
			</div>
			<div>
				{new Array(amount).fill(1).map((_, index) => {
					return (
						<Field
							key={index}
							label={`Fecha de la confirmacion #${index + 1}`}
							type="date"
							placeholder="Escribe aqui la fecha..."
							input={register(`confirmations.${index}`, {
								required: true,
								valueAsDate: true,
							})}
						/>
					);
				})}
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

function Actions(props: CellContext<TableType, unknown>) {
	const { row } = props;
	const [status, setStatus] = React.useState<'idle' | 'loading'>(
		'idle',
	);
	const utils = api.useContext();
	const event = row.original;
	const deleteMutation = api.events.delete.useMutation({
		async onSuccess() {
			await utils.events.getAll.invalidate();
		},
		onSettled() {
			setStatus('idle');
		},
	});

	function onDelete() {
		if (confirm('Esta seguro de eliminar?')) {
			setStatus('loading');
			deleteMutation.mutate({
				id: event.id,
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
			<div className="flex flex-1 space-x-2">
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
