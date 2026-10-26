// Plantillas de textos legales. Los {{campos}} se llenan desde `agency` en brand.js.
// Son BORRADORES: el texto definitivo debe ser revisado por la asesoría legal de la agencia.
export const LEGAL = {
  terminos: {
    titulo: 'Términos y condiciones',
    secciones: [
      { t: 'Aceptación', p: ['Al crear una cuenta o usar el sitio {{dominio}} aceptas estos términos. El sitio es operado por {{razonSocial}}, que opera bajo la marca {{marca}} (en adelante, «la Agencia»). Si no estás de acuerdo, no utilices el sitio.'] },
      { t: 'Qué es {{marca}}', p: ['Somos una agencia de reclutamiento que vincula a candidatos con empleadores en Canadá, en programas de trabajo temporal y con permanencia, principalmente en el sector agrícola.', 'Registro o permiso de la Agencia: {{permiso}}.'], nota: 'Confirmar con el cliente el nombre exacto del permiso/registro y la autoridad que lo emite.' },
      { t: 'Lo que no garantizamos', p: ['La Agencia no garantiza empleo, contratación, visa, permiso de trabajo ni fechas de viaje. La selección corresponde a los empleadores y la autorización migratoria a las autoridades competentes de México y Canadá, cuyas decisiones no dependen de la Agencia.'] },
      { t: 'Tu cuenta', p: ['Debes proporcionar información verdadera y mantenerla actualizada. Eres responsable de la confidencialidad de tu contraseña y de la actividad de tu cuenta. Cada persona debe tener una sola cuenta.'] },
      { t: 'Documentos que subes', p: ['Para tu registro puedes subir pasaporte, identificación oficial (INE), currículum, fotografía de tu rostro y, si cuentas con él, permiso de trabajo. Declaras que los documentos son auténticos y que te pertenecen.', 'La presentación de documentos falsos o alterados puede causar la cancelación de tu proceso y, cuando la ley lo requiera, el aviso a las autoridades. La Agencia puede solicitarte documentos adicionales según tu caso.'] },
      { t: 'Folio y seguimiento', p: ['Cada registro recibe un folio que te permite consultar el avance de tu proceso. La información del sitio es informativa y puede actualizarse conforme avance tu trámite. Las notificaciones se envían por correo electrónico.'] },
      { t: 'Costos', p: ['Cualquier costo asociado a los servicios de la Agencia se te informará por escrito y de forma previa, en el contrato o documento que firmes. No realices pagos por medios distintos a los que la Agencia te indique por escrito.'], nota: 'El cliente indicó que los cobros se tratan directamente con cada candidato y no se muestran en el sitio. Revisar con su abogado si esta cláusula es suficiente.' },
      { t: 'Compartir tu información con terceros', p: ['Autorizas que la Agencia comparta tu perfil y los documentos necesarios con empleadores y con proveedores relacionados con tu proceso (por ejemplo, capacitación y transporte). El tratamiento de tus datos se rige por el aviso de privacidad.'] },
      { t: 'Uso adecuado del sitio', p: ['Queda prohibido suplantar a otra persona, subir contenido ilícito o malicioso, intentar acceder sin autorización a cuentas o sistemas, y automatizar consultas de folios.'] },
      { t: 'Cómo reconocer comunicaciones oficiales', p: ['Solo te contactamos desde correos con el dominio {{dominio}}. Nunca te pediremos tu contraseña por correo o mensaje. Si recibes una comunicación sospechosa, escríbenos a {{correo}}.'] },
      { t: 'Propiedad intelectual', p: ['El nombre, logotipo, textos y diseño del sitio pertenecen a {{razonSocial}} o se usan con autorización. No pueden copiarse ni usarse sin permiso por escrito.'] },
      { t: 'Limitación de responsabilidad', p: ['En la medida que permita la ley, la Agencia no será responsable por daños derivados de decisiones de empleadores o autoridades, interrupciones del sitio, o uso indebido de tu cuenta por causas ajenas a la Agencia.'], nota: 'Texto genérico; el abogado debe ajustarlo a la legislación aplicable.' },
      { t: 'Cambios a estos términos', p: ['Podemos actualizar estos términos. La versión vigente es la publicada en este sitio, con su fecha de actualización.'] },
      { t: 'Ley aplicable y jurisdicción', p: ['Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para su interpretación, las partes se someten a los tribunales competentes de {{jurisdiccion}}.'] },
      { t: 'Contacto', p: ['{{razonSocial}} · {{direccion}} · {{correo}}'] },
    ],
  },
  privacidad: {
    titulo: 'Aviso de privacidad',
    secciones: [
      { t: 'Responsable de tus datos', p: ['{{razonSocial}} (marca {{marca}}), con domicilio en {{direccion}}, es responsable del tratamiento de tus datos personales. Contacto: {{correo}}.'] },
      { t: 'Datos que recabamos', p: ['Para tu proceso de reclutamiento tratamos:'], l: ['Identificación y contacto: nombre, fecha de nacimiento, correo y teléfono.', 'Documentos: pasaporte, identificación oficial (INE), currículum y permiso de trabajo, si lo tienes.', 'Fotografía de tu rostro.', 'Datos de tu proceso: etapa, aprobación o rechazo de documentos, capacitación, empresa asignada y vuelo.', 'Datos técnicos de acceso a tu cuenta.'] },
      { t: 'Fotografía del rostro', p: ['La fotografía de tu rostro se usa para identificarte y para que el equipo verifique que corresponde a tus documentos. Para tratarla te pedimos tu consentimiento expreso al registrarte.'], nota: 'Confirmar con el abogado si la fotografía debe tratarse como dato sensible o biométrico y qué texto de consentimiento requiere. Aclarar si se usará solo para verificación manual.' },
      { t: 'Para qué usamos tus datos', p: ['Finalidades necesarias:'], l: ['Crear y administrar tu cuenta.', 'Evaluar y gestionar tu candidatura.', 'Verificar tu identidad y documentos.', 'Presentar tu perfil a empleadores.', 'Coordinar capacitación, trámites y viaje.', 'Enviarte notificaciones sobre tu proceso por correo.', 'Cumplir obligaciones legales.'] },
      { t: 'Finalidades adicionales', p: ['Con tu consentimiento, también podremos usar tus datos de contacto para informarte sobre nuevas vacantes y para fines estadísticos. Puedes oponerte escribiendo a {{correo}}, sin que afecte tu proceso.'] },
      { t: 'Con quién compartimos tus datos', p: ['Podemos compartir tus datos con:'], l: ['Empleadores y empresas vinculadas con tu proceso, incluidas empresas en Canadá.', 'Aerolíneas y proveedores de viaje o capacitación.', 'Autoridades competentes cuando la ley lo requiera.', 'Proveedores tecnológicos que alojan o procesan información por cuenta de la Agencia (base de datos, almacenamiento y correo).'], nota: 'Listar los proveedores reales y los países de destino. Los datos pueden transferirse fuera de México.' },
      { t: 'Tus derechos', p: ['Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición, así como revocar tu consentimiento o limitar el uso de tus datos, enviando una solicitud a {{correo}} con tu nombre, una identificación, la descripción de lo que solicitas y un medio para responderte.'], nota: 'Agregar plazos de respuesta y procedimiento conforme a la ley vigente.' },
      { t: 'Seguridad y conservación', p: ['Aplicamos medidas administrativas, técnicas y físicas para proteger tus datos. Tus documentos se guardan en almacenamiento privado, con acceso restringido al personal autorizado. Conservamos tu información el tiempo necesario para las finalidades de este aviso y las obligaciones legales.'], nota: 'Definir el plazo de conservación con el cliente.' },
      { t: 'Cookies', p: ['Consulta nuestra política de cookies en este sitio.'] },
      { t: 'Cambios a este aviso', p: ['Cualquier cambio se publicará en esta página con su fecha de actualización.'] },
    ],
  },
  cookies: {
    titulo: 'Política de cookies',
    secciones: [
      { t: 'Qué son', p: ['Son pequeños archivos o datos que tu navegador guarda cuando visitas un sitio, y sirven para que funcione correctamente.'] },
      { t: 'Qué usamos', p: [], l: ['Necesarias: mantienen tu sesión iniciada y la seguridad de tu cuenta. No se pueden desactivar.', 'De medición y publicidad: si se activan herramientas como estadísticas o píxeles de campañas, las indicaremos aquí y pediremos tu consentimiento.'], nota: 'Confirmar con el cliente si se instalarán Meta Pixel u otra analítica. Si es así, agregar un aviso con botón de aceptar o rechazar.' },
      { t: 'Cómo administrarlas', p: ['Puedes borrar o bloquear cookies desde la configuración de tu navegador. Si bloqueas las necesarias, es posible que no puedas iniciar sesión.'] },
      { t: 'Contacto', p: ['Para dudas escribe a {{correo}}.'] },
    ],
  },
}