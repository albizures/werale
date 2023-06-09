import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
	const router = useRouter();
	return (
		<div className="py-2 font-mono">
			<div className="navbar rounded-box border border-base-200 bg-base-100 shadow">
				<div className="navbar-start">
					<div className="dropdown">
						<label tabIndex={0} className="btn-ghost btn lg:hidden">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h8m-8 6h16"
								/>
							</svg>
						</label>
						<ul
							tabIndex={0}
							className="dropdown-content menu rounded-box menu-sm mt-3 w-52 bg-base-100 p-2 shadow"
						>
							<li>
								<Link
									className={clsx({
										active: router.asPath.includes('/invitations'),
									})}
									href={'/invitations'}
								>
									Invitaciones
								</Link>
							</li>
						</ul>
					</div>
					<a className="upppercase btn-ghost btn text-xl">Werale</a>
				</div>
				<div className="navbar-center hidden lg:flex">
					<ul className="menu menu-horizontal px-1">
						<li>
							<Link
								className={clsx({
									active: router.asPath.includes('/invitations'),
								})}
								href={'/invitations'}
							>
								Invitaciones
							</Link>
						</li>
					</ul>
				</div>
				<div className="navbar-end">
					<a className="btn-ghost btn">Sign Out</a>
				</div>
			</div>
		</div>
	);
}
