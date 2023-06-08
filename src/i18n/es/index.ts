import type { BaseTranslation } from '../i18n-types';

const de = {
	acceptInvitation: '{{ Asistire | Asistiremos }}',
	declineInvitation: 'No podre{{mos}} asistir',
	inviteMessage:
		'Será un honor que nos acompañe{{ s| n }} en nuestra boda',
	confirmPlease:
		'Ahora que sabes donde será el chonguenge ¿nos acompañará{{s | n}}?',
	howMany: '¿Cuántos irán?',
	church: {
		title: '¿Tienes duda de donde es la misa?',
		description: 'La iglesia se llama El Divino Redentor',
		parking:
			'La iglesia cuenta con parqueo y cobran Q5.00 en efectivo.',
		footer: 'Echa un vistazo de las instalciones',
	},
	reception: {
		title: '¿Tienes duda de donde es la recepcion?',
		description: "El lugar se llama Amnery's Castle",
		parking:
			'Se encentra después del CC Santa Clara, camino a Delta Bárcenas, cuenta con parqueo gratis.',
		footer: 'Echa un vistazo de las instalciones',
	},
} satisfies BaseTranslation;

export default de;
