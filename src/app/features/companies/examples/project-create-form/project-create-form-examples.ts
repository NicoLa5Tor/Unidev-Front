export interface ProjectCreateFormExample {
  id: string;
  label: string;
  values: {
    name: string;
    businessObjective: string;
    targetUsers: string;
    mainModules: string;
    integrations: string;
    platforms: string;
    deliveryDeadline: string;
    technicalConstraints: string;
    description: string;
    budgetAmount: string;
    developmentTypeSuggestedCode: string;
    developmentTypeSuggestedLabel: string;
  };
}

export const PROJECT_CREATE_FORM_EXAMPLES: ProjectCreateFormExample[] = [
  {
    id: 'landing_admin_contenido',
    label: 'Landing editable con panel admin',
    values: {
      name: 'Landing comercial editable para captacion de clientes',
      businessObjective:
        'Captar clientes potenciales, mostrar propuesta de valor clara y permitir que el equipo comercial actualice contenido sin depender de desarrollo.',
      targetUsers: 'Clientes finales, visitantes nuevos, equipo comercial y administrador de marketing.',
      mainModules:
        'Landing publica, formulario de contacto, secciones de servicios, testimonios, preguntas frecuentes, panel admin para editar textos, imagenes y orden de bloques.',
      integrations: 'WhatsApp, correo transaccional, Google Maps embebido, formulario de contacto.',
      platforms: 'Web publica, panel admin web responsive.',
      deliveryDeadline: 'Primera version en 4 semanas con salida comercial inmediata.',
      technicalConstraints:
        'Debe cargar rapido en mobile, permitir edicion simple de contenido y evitar dependencias complejas de terceros.',
      description:
        'El proyecto consiste en una landing comercial para mostrar servicios de la empresa, beneficios, preguntas frecuentes, ubicacion y formularios de contacto. El equipo interno debe poder editar titulos, textos, imagenes, banners, testimonios y llamadas a la accion desde un panel administrativo sencillo. El sitio debe estar optimizado para mobile, incluir seguimiento basico de conversiones y permitir publicar cambios sin intervencion tecnica.',
      budgetAmount: '12000000',
      developmentTypeSuggestedCode: 'WEB',
      developmentTypeSuggestedLabel: 'Web'
    }
  },
  {
    id: 'ecommerce_pedidos_pagos',
    label: 'Ecommerce con pagos y pedidos',
    values: {
      name: 'Tienda online con pedidos, pagos y panel de operacion',
      businessObjective:
        'Vender productos en linea, centralizar pedidos y reducir trabajo manual del equipo comercial y logistico.',
      targetUsers:
        'Clientes finales, operadores internos, administradores de catalogo, personal de soporte y coordinadores logisticos.',
      mainModules:
        'Catalogo, detalle de producto, carrito, checkout, pagos, estados de pedido, panel admin, gestion de clientes, promociones y reportes basicos.',
      integrations: 'Pasarela de pagos, correo transaccional, WhatsApp, operador logistico o integracion de envios, Google Analytics.',
      platforms: 'Web publica para clientes, panel admin web para operacion interna.',
      deliveryDeadline: 'MVP comercial en 8 semanas y estabilizacion operativa en 10 semanas.',
      technicalConstraints:
        'Debe soportar inventario basico, validaciones de pago, seguimiento de pedidos y control de estados sin caidas en momentos de alta demanda.',
      description:
        'Se requiere una tienda online donde el cliente pueda navegar productos, filtrar categorias, agregar productos al carrito, pagar y consultar el estado del pedido. Internamente la empresa debe administrar catalogo, stock, clientes, descuentos y pedidos desde un panel administrativo. El flujo debe incluir confirmaciones por correo, manejo de errores de pago, control de estados, historial de pedidos y reportes simples de ventas y conversiones.',
      budgetAmount: '45000000',
      developmentTypeSuggestedCode: 'WEB',
      developmentTypeSuggestedLabel: 'Web'
    }
  },
  {
    id: 'portal_reservas_servicios',
    label: 'Portal de reservas y agenda',
    values: {
      name: 'Portal de reservas para agenda de servicios',
      businessObjective:
        'Automatizar la toma de reservas, reducir llamadas manuales y mejorar la ocupacion de la agenda.',
      targetUsers: 'Clientes finales, recepcionistas, administradores de agenda y coordinadores operativos.',
      mainModules:
        'Agenda publica, seleccion de servicio, disponibilidad, reserva, recordatorios, calendario interno, reasignacion de citas, reportes de ocupacion y panel admin.',
      integrations: 'Correo, WhatsApp, calendario externo opcional, pasarela de pago para abonos.',
      platforms: 'Web publica, panel interno web responsive.',
      deliveryDeadline: 'Salida en 6 semanas para iniciar pruebas con una sede principal.',
      technicalConstraints:
        'Debe manejar zonas horarias simples, evitar dobles reservas y permitir configuracion flexible de horarios por sede o profesional.',
      description:
        'El sistema debe permitir que los clientes consulten disponibilidad real, reserven un servicio, reciban confirmacion y puedan reprogramar bajo ciertas reglas. Internamente el personal debe ver la agenda por dia, mover reservas, bloquear horarios, configurar servicios y revisar indicadores de ocupacion. Debe contemplar estados de cita, recordatorios, cupos y reglas minimas para evitar solapamientos.',
      budgetAmount: '22000000',
      developmentTypeSuggestedCode: 'WEB',
      developmentTypeSuggestedLabel: 'Web'
    }
  },
  {
    id: 'erp_operacion_interna',
    label: 'ERP operativo interno',
    values: {
      name: 'ERP interno para inventario, compras y reportes',
      businessObjective:
        'Ordenar la operacion interna, controlar inventario y mejorar la trazabilidad de compras, movimientos y reportes gerenciales.',
      targetUsers: 'Administradores, personal de compras, almacenistas, coordinadores operativos y gerencia.',
      mainModules:
        'Inventario, compras, proveedores, movimientos, aprobaciones, reportes, roles y permisos, alertas de stock y panel administrativo.',
      integrations: 'ERP legado o importacion por archivos, correo, exportacion a Excel o PDF.',
      platforms: 'Web interna, panel administrativo corporativo.',
      deliveryDeadline: 'Primera fase en 10 semanas con modulos criticos de inventario y compras.',
      technicalConstraints:
        'Debe manejar permisos por rol, historicos auditables, importacion de datos inicial y reglas de aprobacion sin perder trazabilidad.',
      description:
        'Se necesita una plataforma interna para controlar productos, stock, entradas, salidas, ordenes de compra, proveedores y aprobaciones de movimientos. La gerencia debe consultar reportes por periodo, categoria y sede. El sistema debe guardar trazabilidad de cambios, manejar roles, generar alertas por faltantes y permitir carga inicial o sincronizacion parcial con fuentes externas.',
      budgetAmount: '65000000',
      developmentTypeSuggestedCode: 'WEB',
      developmentTypeSuggestedLabel: 'Web'
    }
  },
  {
    id: 'plataforma_educativa',
    label: 'Plataforma educativa con paneles',
    values: {
      name: 'Plataforma educativa con cursos, evaluaciones y panel docente',
      businessObjective:
        'Digitalizar la oferta academica, permitir seguimiento del aprendizaje y reducir procesos manuales de publicacion de contenidos y evaluaciones.',
      targetUsers: 'Estudiantes, docentes, coordinadores academicos y administradores.',
      mainModules:
        'Catalogo de cursos, lecciones, evaluaciones, progreso, panel docente, roles, inscripciones, notificaciones y reportes academicos.',
      integrations: 'Correo, video embebido o plataforma de streaming, pagos opcionales para cursos premium.',
      platforms: 'Web, panel docente web, acceso responsive para estudiantes.',
      deliveryDeadline: 'Lanzamiento piloto en 12 semanas con 3 cursos iniciales.',
      technicalConstraints:
        'Debe soportar contenido multimedia, progreso por usuario, permisos por rol y evaluaciones con resultados historicos.',
      description:
        'El proyecto requiere una plataforma donde los estudiantes puedan inscribirse en cursos, consumir lecciones, presentar evaluaciones y ver su progreso. Los docentes deben gestionar contenido, publicar materiales y revisar resultados. La coordinacion academica necesita indicadores, control de grupos y trazabilidad de actividad. Debe existir una experiencia clara para estudiantes y una operacion interna util para el equipo academico.',
      budgetAmount: '70000000',
      developmentTypeSuggestedCode: 'HIBRIDO',
      developmentTypeSuggestedLabel: 'Hibrido'
    }
  },
  {
    id: 'mesa_ayuda_clientes',
    label: 'Portal de soporte y tickets',
    values: {
      name: 'Portal de soporte con tickets y seguimiento al cliente',
      businessObjective:
        'Centralizar solicitudes de soporte, mejorar tiempos de respuesta y dar trazabilidad al estado de cada caso.',
      targetUsers: 'Clientes finales, agentes de soporte, supervisores y administradores.',
      mainModules:
        'Creacion de tickets, bandeja de soporte, estados, prioridades, comentarios, archivos adjuntos, base de conocimiento y reportes de atencion.',
      integrations: 'Correo, WhatsApp, carga de archivos, notificaciones internas.',
      platforms: 'Web publica para clientes, panel interno web para agentes y supervisores.',
      deliveryDeadline: 'Version operativa en 6 semanas con equipo de soporte inicial.',
      technicalConstraints:
        'Debe permitir adjuntos, historial completo del caso, filtros por estado y prioridad, y notificaciones claras para cliente y agente.',
      description:
        'Se necesita un portal donde los clientes puedan registrar incidencias, consultar el estado del caso y responder a solicitudes del equipo de soporte. Internamente los agentes deben clasificar, priorizar, reasignar y resolver tickets con trazabilidad completa. El sistema debe manejar comentarios, adjuntos, estados, acuerdos de respuesta simples y reportes de volumen, tiempos y tipos de incidencia.',
      budgetAmount: '28000000',
      developmentTypeSuggestedCode: 'WEB',
      developmentTypeSuggestedLabel: 'Web'
    }
  }
];
