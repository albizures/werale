import { type RequiredParams } from 'typesafe-i18n';
import type { Translation } from '../i18n-types';

const en = {
	acceptInvitation: "{{ I | We }}'ll assist",
	declineInvitation: "{{ I | We }} won't assist",
	inviteMessage:
		'{name: string} You are cordially invited to our wedding celebration' as unknown as RequiredParams<'name'>,
	confirmPlease: 'Confirm us if you can go',
	howMany: 'How many will go?',
	church: {
		title: '¿Tienes duda de donde es la misa?',
		description: 'La iglesia se llama El Divino Redentor',
		parking:
			'La iglesia cuenta con parqueo y cobran Q5.00 en efectivo.',
		footer: 'Echa un vistazo de las instalaciones',
	},
	reception: {
		title: '¿Tienes duda de donde es la recepcion?',
		description: "El lugar se llama Amnery's Castle",
		parking:
			'Se encentra después del CC Santa Clara, camino a Delta Bárcenas, cuenta con parqueo gratis.',
		footer: 'Echa un vistazo de las instalaciones',
	},
} satisfies Translation;

export default en;
