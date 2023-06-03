import { type UseFormRegisterReturn } from 'react-hook-form';

interface FieldProps<T extends string> {
	label: string;
	type?: React.HTMLInputTypeAttribute;
	placeholder?: string;
	input: UseFormRegisterReturn<T>;
}

export function Field<T extends string>(props: FieldProps<T>) {
	const {
		type = 'text',
		label,
		input,
		placeholder = 'Escribe aqui...',
	} = props;

	return (
		<div className="form-control w-full max-w-xs">
			<label className="label">
				<span className="label-text font-bold capitalize">
					{label}
				</span>
			</label>
			<input
				type={type}
				placeholder={placeholder}
				className="input-bordered input input-md"
				{...input}
			/>
		</div>
	);
}
