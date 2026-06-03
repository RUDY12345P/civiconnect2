// =============================================
// CiviConnect - events.js
// Eventos demo de Cancún + Firestore opcional
// =============================================

let firebaseServicesPromise = null;

const LOCAL_EVENTS_KEY = 'civiconnect_demo_events';
const DEMO_SESSION_KEY = 'civiconnect_demo_session';

const EVENT_CATEGORY_META = {
  voluntariado: {
    label: 'Voluntariado',
    shortLabel: 'Voluntariado',
    icon: '🌱',
    className: 'volunteer',
    color: '#1D9E75'
  },
  medioambiente: {
    label: 'Medio ambiente',
    shortLabel: 'Ambiente',
    icon: '♻️',
    className: 'env',
    color: '#0F8A84'
  },
  educacion: {
    label: 'Educación',
    shortLabel: 'Educación',
    icon: '📚',
    className: 'education',
    color: '#378ADD'
  },
  salud: {
    label: 'Salud',
    shortLabel: 'Salud',
    icon: '❤️',
    className: 'health',
    color: '#E24B4A'
  },
  cultura: {
    label: 'Cultura',
    shortLabel: 'Cultura',
    icon: '🎨',
    className: 'culture',
    color: '#7F77DD'
  },
  deportes: {
    label: 'Deportes',
    shortLabel: 'Deportes',
    icon: '⚽',
    className: 'sports',
    color: '#0F8A84'
  },
  derechos: {
    label: 'Comunidad',
    shortLabel: 'Comunidad',
    icon: '🤝',
    className: 'rights',
    color: '#EF9F27'
  }
};

const SAMPLE_EVENTS = [
  {
    id: 'ev001',
    title: 'Guardianes de Playa Delfines',
    description: 'Jornada para retirar residuos, separar reciclables y proteger la zona de anidación. Incluye reto por equipos y punto de hidratación.',
    category: 'medioambiente',
    date: '2026-06-06',
    time: '07:00',
    endTime: '11:00',
    location: 'Playa Delfines, Zona Hotelera, Cancún',
    city: 'Cancún',
    lat: 21.0353,
    lng: -86.7913,
    organizer: 'Mar Limpio Cancún',
    organizerId: 'org001',
    image: '🌊',
    maxCapacity: 90,
    enrolled: 61,
    points: 70,
    status: 'active',
    impact: '120 kg menos de residuos en playa',
    difficulty: 'Familiar',
    tags: ['playa', 'limpieza', 'reciclaje', 'zona-hotelera']
  },
  {
    id: 'ev002',
    title: 'Manglares Vivos en Nichupté',
    description: 'Plantación guiada de mangle, monitoreo básico del agua y charla breve sobre la importancia de la laguna.',
    category: 'medioambiente',
    date: '2026-06-13',
    time: '07:30',
    endTime: '11:30',
    location: 'Laguna Nichupté, entrada por Jardín del Arte, Cancún',
    city: 'Cancún',
    lat: 21.0921,
    lng: -86.7821,
    organizer: 'Ecosistemas del Caribe',
    organizerId: 'org002',
    image: '🌿',
    maxCapacity: 55,
    enrolled: 37,
    points: 80,
    status: 'active',
    impact: '300 plantas nativas sembradas',
    difficulty: 'Activo',
    tags: ['manglar', 'laguna', 'reforestación']
  },
  {
    id: 'ev003',
    title: 'Despensa Solidaria en Plaza Las Américas',
    description: 'Colecta de alimentos no perecederos para familias de Cancún. Apoya recibiendo donativos y armando paquetes.',
    category: 'voluntariado',
    date: '2026-06-07',
    time: '09:00',
    endTime: '14:00',
    location: 'Plaza Las Américas, Av. Tulum Sur, Cancún',
    city: 'Cancún',
    lat: 21.1563,
    lng: -86.8475,
    organizer: 'Banco de Alimentos Quintana Roo',
    organizerId: 'org003',
    image: '🥫',
    maxCapacity: 150,
    enrolled: 92,
    points: 55,
    status: 'active',
    impact: '500 despensas para colonias de Cancún',
    difficulty: 'Ligero',
    tags: ['alimentos', 'solidaridad', 'familias']
  },
  {
    id: 'ev004',
    title: 'Brigada de Salud en Parque de las Palapas',
    description: 'Apoya en registro y logística durante consultas médicas, vacunación y módulos de prevención comunitaria.',
    category: 'salud',
    date: '2026-06-14',
    time: '08:00',
    endTime: '15:00',
    location: 'Parque de las Palapas, Centro, Cancún',
    city: 'Cancún',
    lat: 21.1619,
    lng: -86.8515,
    organizer: 'Salud Para Todos Q. Roo',
    organizerId: 'org004',
    image: '❤️',
    maxCapacity: 120,
    enrolled: 83,
    points: 65,
    status: 'active',
    impact: '700 atenciones comunitarias',
    difficulty: 'Ligero',
    tags: ['salud', 'brigada', 'prevención']
  },
  {
    id: 'ev005',
    title: 'Aula Abierta: Matemáticas y Español',
    description: 'Sesiones de apoyo académico para niñas, niños y adolescentes. Participa como tutor o facilitador de lectura.',
    category: 'educacion',
    date: '2026-06-10',
    time: '16:00',
    endTime: '18:30',
    location: 'Biblioteca Pública de Cancún, Supermanzana 23',
    city: 'Cancún',
    lat: 21.1697,
    lng: -86.8501,
    organizer: 'Tutores Voluntarios Cancún',
    organizerId: 'org001',
    image: '📚',
    maxCapacity: 36,
    enrolled: 21,
    points: 45,
    status: 'active',
    impact: '60 estudiantes con acompañamiento',
    difficulty: 'Familiar',
    tags: ['educación', 'tutorías', 'lectura']
  },
  {
    id: 'ev006',
    title: 'Noche Caribeña de Arte y Comunidad',
    description: 'Festival participativo con murales colectivos, música local, talleres creativos y muestra gastronómica.',
    category: 'cultura',
    date: '2026-06-21',
    time: '17:00',
    endTime: '21:30',
    location: 'Malecón Tajamar, Cancún',
    city: 'Cancún',
    lat: 21.1459,
    lng: -86.8217,
    organizer: 'Cultura Viva Cancún',
    organizerId: 'org005',
    image: '🎭',
    maxCapacity: 260,
    enrolled: 184,
    points: 35,
    status: 'active',
    impact: '8 talleres abiertos a la comunidad',
    difficulty: 'Familiar',
    tags: ['arte', 'cultura', 'música', 'tajamar']
  },
  {
    id: 'ev007',
    title: 'Cabildo Abierto: Movilidad Segura',
    description: 'Mesa ciudadana para proponer rutas, cruces seguros y ciclovías. Incluye dinámica de mapas y votación.',
    category: 'derechos',
    date: '2026-06-17',
    time: '18:00',
    endTime: '20:00',
    location: 'Palacio Municipal de Benito Juárez, Centro, Cancún',
    city: 'Cancún',
    lat: 21.1613,
    lng: -86.8512,
    organizer: 'Ciudadanía Activa Cancún',
    organizerId: 'org006',
    image: '🤝',
    maxCapacity: 200,
    enrolled: 74,
    points: 50,
    status: 'active',
    impact: 'Propuestas ciudadanas para movilidad',
    difficulty: 'Ligero',
    tags: ['movilidad', 'transporte', 'cabildo']
  },
  {
    id: 'ev008',
    title: 'Guardianes Nocturnos de Tortugas',
    description: 'Monitoreo nocturno de nidos y orientación a visitantes para proteger tortugas marinas.',
    category: 'medioambiente',
    date: '2026-06-28',
    time: '21:00',
    endTime: '02:00',
    location: 'Playa Marlín, Zona Hotelera, Cancún',
    city: 'Cancún',
    lat: 21.1029,
    lng: -86.7642,
    organizer: 'Tortugas del Caribe A.C.',
    organizerId: 'org002',
    image: '🐢',
    maxCapacity: 40,
    enrolled: 34,
    points: 90,
    status: 'active',
    impact: 'Nidos protegidos durante temporada',
    difficulty: 'Activo',
    tags: ['tortugas', 'conservación', 'playa']
  },
  {
    id: 'ev009',
    title: 'Primeros Auxilios para Vecinos',
    description: 'Taller didáctico con práctica de RCP, control de hemorragias y armado de botiquín familiar.',
    category: 'salud',
    date: '2026-06-24',
    time: '10:00',
    endTime: '13:00',
    location: 'Centro Comunitario de la Supermanzana 96, Cancún',
    city: 'Cancún',
    lat: 21.1545,
    lng: -86.8788,
    organizer: 'Cruz Roja Mexicana Cancún',
    organizerId: 'org007',
    image: '🚑',
    maxCapacity: 48,
    enrolled: 29,
    points: 60,
    status: 'active',
    impact: 'Vecinos preparados para emergencias',
    difficulty: 'Ligero',
    tags: ['primeros-auxilios', 'rcp', 'prevención']
  },
  {
    id: 'ev010',
    title: 'Ruta Histórica por el Centro de Cancún',
    description: 'Recorrido guiado por puntos históricos del centro con cápsulas de memoria local y fotografía comunitaria.',
    category: 'cultura',
    date: '2026-06-27',
    time: '08:30',
    endTime: '11:00',
    location: 'Parque del Crucero, Cancún',
    city: 'Cancún',
    lat: 21.1714,
    lng: -86.8499,
    organizer: 'Cronistas Jóvenes de Cancún',
    organizerId: 'org005',
    image: '📸',
    maxCapacity: 70,
    enrolled: 45,
    points: 40,
    status: 'active',
    impact: 'Memoria barrial documentada',
    difficulty: 'Familiar',
    tags: ['historia', 'fotografía', 'centro']
  },
  {
    id: 'ev011',
    title: 'Alfabetización Digital para Adultos',
    description: 'Acompaña a personas adultas en uso básico del celular, trámites digitales y seguridad en línea.',
    category: 'educacion',
    date: '2026-07-04',
    time: '11:00',
    endTime: '13:30',
    location: 'Universidad del Caribe, Cancún',
    city: 'Cancún',
    lat: 21.2106,
    lng: -86.8022,
    organizer: 'Red Aprende Cancún',
    organizerId: 'org008',
    image: '💻',
    maxCapacity: 44,
    enrolled: 18,
    points: 55,
    status: 'active',
    impact: 'Adultos con habilidades digitales básicas',
    difficulty: 'Ligero',
    tags: ['tecnología', 'adultos', 'educación']
  },
  {
    id: 'ev012',
    title: 'Feria de Derechos y Servicios',
    description: 'Módulos de orientación ciudadana, defensoría, transparencia y participación comunitaria.',
    category: 'derechos',
    date: '2026-07-11',
    time: '09:30',
    endTime: '14:00',
    location: 'Parque Kabah, Cancún',
    city: 'Cancún',
    lat: 21.1421,
    lng: -86.8373,
    organizer: 'Red Cívica Benito Juárez',
    organizerId: 'org006',
    image: '⚖️',
    maxCapacity: 110,
    enrolled: 53,
    points: 60,
    status: 'active',
    impact: 'Orientación directa para vecinos',
    difficulty: 'Ligero',
    tags: ['derechos', 'servicios', 'participación']
  },
  {
    id: 'ev013',
    title: 'Torneo Comunitario en Parque Kabah',
    description: 'Partidos amistosos de fútbol mixto para promover convivencia, actividad física y trabajo en equipo.',
    category: 'deportes',
    date: '2026-06-29',
    time: '08:00',
    endTime: '13:00',
    location: 'Parque Kabah, Cancún',
    city: 'Cancún',
    lat: 21.1421,
    lng: -86.8373,
    organizer: 'Deporte Comunitario Cancún',
    organizerId: 'org009',
    image: '⚽',
    maxCapacity: 96,
    enrolled: 52,
    points: 45,
    status: 'active',
    impact: 'Convivencia deportiva para jóvenes y familias',
    difficulty: 'Activo',
    tags: ['fútbol', 'deporte', 'familia', 'kabah']
  },
  {
    id: 'ev014',
    title: 'Rodada Segura por la Ciclovía',
    description: 'Recorrido guiado en bicicleta con charla de seguridad vial y puntos de hidratación.',
    category: 'deportes',
    date: '2026-07-05',
    time: '07:00',
    endTime: '10:30',
    location: 'Salida desde Malecón Tajamar, Cancún',
    city: 'Cancún',
    lat: 21.1459,
    lng: -86.8217,
    organizer: 'BiciRed Cancún',
    organizerId: 'org009',
    image: '🚲',
    maxCapacity: 80,
    enrolled: 36,
    points: 50,
    status: 'active',
    impact: 'Promoción de movilidad segura y saludable',
    difficulty: 'Activo',
    tags: ['bicicleta', 'movilidad', 'deporte']
  },
  {
    id: 'ev015',
    title: 'Huerto Vecinal en Supermanzana 50',
    description: 'Construcción de camas de cultivo, composta y siembra de hortalizas para consumo comunitario.',
    category: 'medioambiente',
    date: '2026-07-08',
    time: '08:00',
    endTime: '12:00',
    location: 'Parque de la Supermanzana 50, Cancún',
    city: 'Cancún',
    lat: 21.1492,
    lng: -86.8681,
    organizer: 'Huertos Urbanos Cancún',
    organizerId: 'org010',
    image: '🥬',
    maxCapacity: 60,
    enrolled: 22,
    points: 55,
    status: 'active',
    impact: 'Huerto comunitario activo para familias',
    difficulty: 'Familiar',
    tags: ['huerto', 'composta', 'familias']
  },
  {
    id: 'ev016',
    title: 'Lectura en Voz Alta para Niños',
    description: 'Círculo de lectura, juegos de comprensión y préstamo de libros para niñas y niños.',
    category: 'educacion',
    date: '2026-07-09',
    time: '17:00',
    endTime: '19:00',
    location: 'Casa de la Cultura de Cancún',
    city: 'Cancún',
    lat: 21.1581,
    lng: -86.8469,
    organizer: 'Biblioteca Viva',
    organizerId: 'org008',
    image: '📖',
    maxCapacity: 35,
    enrolled: 16,
    points: 40,
    status: 'active',
    impact: 'Fomento lector en infancia',
    difficulty: 'Ligero',
    tags: ['lectura', 'niñez', 'libros']
  },
  {
    id: 'ev017',
    title: 'Cine Comunitario Bajo las Estrellas',
    description: 'Proyección gratuita con dinámicas de convivencia, apoyo logístico y limpieza del espacio.',
    category: 'cultura',
    date: '2026-07-12',
    time: '18:30',
    endTime: '22:00',
    location: 'Parque de la Región 95, Cancún',
    city: 'Cancún',
    lat: 21.1512,
    lng: -86.8807,
    organizer: 'Pantalla Abierta Cancún',
    organizerId: 'org005',
    image: '🎬',
    maxCapacity: 180,
    enrolled: 91,
    points: 35,
    status: 'active',
    impact: 'Cultura gratuita en espacios públicos',
    difficulty: 'Familiar',
    tags: ['cine', 'convivencia', 'parque']
  },
  {
    id: 'ev018',
    title: 'Recolección de Tapitas con Causa',
    description: 'Clasificación y acopio de tapitas para apoyar tratamientos médicos infantiles.',
    category: 'voluntariado',
    date: '2026-07-13',
    time: '10:00',
    endTime: '14:00',
    location: 'Plaza Outlet Cancún',
    city: 'Cancún',
    lat: 21.1403,
    lng: -86.8581,
    organizer: 'Tapitas Caribe',
    organizerId: 'org003',
    image: '🧢',
    maxCapacity: 75,
    enrolled: 31,
    points: 45,
    status: 'active',
    impact: 'Acopio solidario para familias',
    difficulty: 'Ligero',
    tags: ['tapitas', 'salud', 'solidaridad']
  },
  {
    id: 'ev019',
    title: 'Clase Abierta de Yoga en Tajamar',
    description: 'Sesión de bienestar, respiración y movilidad para vecinos de todas las edades.',
    category: 'salud',
    date: '2026-07-15',
    time: '06:30',
    endTime: '08:00',
    location: 'Malecón Tajamar, Cancún',
    city: 'Cancún',
    lat: 21.1459,
    lng: -86.8217,
    organizer: 'Bienestar Comunitario',
    organizerId: 'org004',
    image: '🧘',
    maxCapacity: 85,
    enrolled: 42,
    points: 35,
    status: 'active',
    impact: 'Promoción de salud mental y física',
    difficulty: 'Familiar',
    tags: ['yoga', 'bienestar', 'salud']
  },
  {
    id: 'ev020',
    title: 'Pinta tu Parque: Región 102',
    description: 'Jornada para pintar bancas, señalética y murales pequeños con vecinos y artistas locales.',
    category: 'cultura',
    date: '2026-07-16',
    time: '08:30',
    endTime: '13:30',
    location: 'Parque de la Región 102, Cancún',
    city: 'Cancún',
    lat: 21.1596,
    lng: -86.8892,
    organizer: 'Arte Barrio Cancún',
    organizerId: 'org005',
    image: '🎨',
    maxCapacity: 70,
    enrolled: 24,
    points: 60,
    status: 'active',
    impact: 'Espacio público renovado',
    difficulty: 'Activo',
    tags: ['murales', 'parque', 'vecinos']
  },
  {
    id: 'ev021',
    title: 'Canasta Básica para Adultos Mayores',
    description: 'Armado y entrega de paquetes de apoyo con registro y acompañamiento comunitario.',
    category: 'voluntariado',
    date: '2026-07-18',
    time: '09:00',
    endTime: '13:00',
    location: 'DIF Benito Juárez, Cancún',
    city: 'Cancún',
    lat: 21.1611,
    lng: -86.8625,
    organizer: 'Manos Unidas Cancún',
    organizerId: 'org003',
    image: '🧺',
    maxCapacity: 95,
    enrolled: 48,
    points: 60,
    status: 'active',
    impact: 'Apoyo directo a adultos mayores',
    difficulty: 'Ligero',
    tags: ['adultos-mayores', 'despensa', 'apoyo']
  },
  {
    id: 'ev022',
    title: 'Taller de Emprendimiento Joven',
    description: 'Mentorías rápidas sobre prototipos, costos, ventas digitales e ideas con impacto social.',
    category: 'educacion',
    date: '2026-07-20',
    time: '16:00',
    endTime: '19:00',
    location: 'Universidad Tecnológica de Cancún',
    city: 'Cancún',
    lat: 21.0493,
    lng: -86.8466,
    organizer: 'Jóvenes Innovan Q. Roo',
    organizerId: 'org008',
    image: '💡',
    maxCapacity: 64,
    enrolled: 27,
    points: 50,
    status: 'active',
    impact: 'Ideas juveniles listas para pilotear',
    difficulty: 'Ligero',
    tags: ['emprendimiento', 'jóvenes', 'innovación']
  },
  {
    id: 'ev023',
    title: 'Reforestación en Avenida Huayacán',
    description: 'Siembra de árboles nativos, riego inicial y adopción de árboles por equipos.',
    category: 'medioambiente',
    date: '2026-07-22',
    time: '07:00',
    endTime: '11:00',
    location: 'Av. Huayacán, Cancún',
    city: 'Cancún',
    lat: 21.1049,
    lng: -86.8662,
    organizer: 'Raíces de Cancún',
    organizerId: 'org010',
    image: '🌳',
    maxCapacity: 120,
    enrolled: 58,
    points: 75,
    status: 'active',
    impact: '120 árboles nativos sembrados',
    difficulty: 'Activo',
    tags: ['reforestación', 'árboles', 'huayacán']
  },
  {
    id: 'ev024',
    title: 'Liga Relámpago de Voleibol',
    description: 'Torneo vecinal mixto con arbitraje voluntario y convivencia entre colonias.',
    category: 'deportes',
    date: '2026-07-24',
    time: '17:00',
    endTime: '21:00',
    location: 'Unidad Deportiva Toro Valenzuela, Cancún',
    city: 'Cancún',
    lat: 21.1738,
    lng: -86.8446,
    organizer: 'Deporte Comunitario Cancún',
    organizerId: 'org009',
    image: '🏐',
    maxCapacity: 100,
    enrolled: 46,
    points: 45,
    status: 'active',
    impact: 'Convivencia deportiva barrial',
    difficulty: 'Activo',
    tags: ['voleibol', 'deporte', 'colonias']
  },
  {
    id: 'ev025',
    title: 'Jornada de Adopción Responsable',
    description: 'Apoyo en registro, orientación a familias y difusión de adopción responsable.',
    category: 'voluntariado',
    date: '2026-07-25',
    time: '10:00',
    endTime: '15:00',
    location: 'Parque Kabah, Cancún',
    city: 'Cancún',
    lat: 21.1421,
    lng: -86.8373,
    organizer: 'Huellas Cancún',
    organizerId: 'org011',
    image: '🐾',
    maxCapacity: 55,
    enrolled: 19,
    points: 50,
    status: 'active',
    impact: 'Adopciones responsables y orientación',
    difficulty: 'Familiar',
    tags: ['adopción', 'mascotas', 'familias']
  },
  {
    id: 'ev026',
    title: 'Foro Vecinal de Seguridad',
    description: 'Mesa de propuestas para prevención, iluminación, rutas seguras y redes de apoyo vecinal.',
    category: 'derechos',
    date: '2026-07-27',
    time: '18:00',
    endTime: '20:30',
    location: 'Centro Comunitario Región 100, Cancún',
    city: 'Cancún',
    lat: 21.1609,
    lng: -86.8876,
    organizer: 'Ciudadanía Activa Cancún',
    organizerId: 'org006',
    image: '🗣️',
    maxCapacity: 130,
    enrolled: 54,
    points: 55,
    status: 'active',
    impact: 'Agenda vecinal de seguridad preventiva',
    difficulty: 'Ligero',
    tags: ['seguridad', 'vecinos', 'foro']
  },
  {
    id: 'ev027',
    title: 'Taller de Reciclaje Creativo',
    description: 'Transforma cartón, plástico y vidrio en objetos útiles para casa o escuela.',
    category: 'medioambiente',
    date: '2026-07-29',
    time: '11:00',
    endTime: '14:00',
    location: 'Planetario Ka Yok, Cancún',
    city: 'Cancún',
    lat: 21.1618,
    lng: -86.8318,
    organizer: 'EcoAprende Cancún',
    organizerId: 'org010',
    image: '♻️',
    maxCapacity: 50,
    enrolled: 23,
    points: 45,
    status: 'active',
    impact: 'Residuos convertidos en aprendizaje',
    difficulty: 'Familiar',
    tags: ['reciclaje', 'taller', 'familias']
  },
  {
    id: 'ev028',
    title: 'Caminata por la Salud del Corazón',
    description: 'Recorrido de baja intensidad con toma de presión y consejos de prevención cardiovascular.',
    category: 'salud',
    date: '2026-08-01',
    time: '07:00',
    endTime: '09:30',
    location: 'Parque Urbano Kabah, Cancún',
    city: 'Cancún',
    lat: 21.1421,
    lng: -86.8373,
    organizer: 'Salud Para Todos Q. Roo',
    organizerId: 'org004',
    image: '❤️',
    maxCapacity: 140,
    enrolled: 67,
    points: 40,
    status: 'active',
    impact: 'Prevención cardiovascular comunitaria',
    difficulty: 'Familiar',
    tags: ['salud', 'caminata', 'prevención']
  },
  {
    id: 'ev029',
    title: 'Club de Tareas en Villas Otoch',
    description: 'Apoyo escolar para primaria y secundaria con dinámicas de lectura, matemáticas y ciencia.',
    category: 'educacion',
    date: '2026-08-03',
    time: '16:30',
    endTime: '19:00',
    location: 'Centro Comunitario Villas Otoch, Cancún',
    city: 'Cancún',
    lat: 21.1899,
    lng: -86.8878,
    organizer: 'Tutores Voluntarios Cancún',
    organizerId: 'org001',
    image: '✏️',
    maxCapacity: 48,
    enrolled: 20,
    points: 55,
    status: 'active',
    impact: 'Acompañamiento escolar gratuito',
    difficulty: 'Ligero',
    tags: ['tareas', 'escuela', 'niñez']
  },
  {
    id: 'ev030',
    title: 'Mercadito de Productores Locales',
    description: 'Apoyo a logística, señalética y difusión para productores y artesanos de Cancún.',
    category: 'cultura',
    date: '2026-08-05',
    time: '09:00',
    endTime: '16:00',
    location: 'Explanada del Palacio Municipal, Cancún',
    city: 'Cancún',
    lat: 21.1613,
    lng: -86.8512,
    organizer: 'Economía Local Viva',
    organizerId: 'org005',
    image: '🛍️',
    maxCapacity: 90,
    enrolled: 39,
    points: 45,
    status: 'active',
    impact: 'Impulso a productores locales',
    difficulty: 'Ligero',
    tags: ['mercado', 'artesanos', 'economía-local']
  },
  {
    id: 'ev031',
    title: 'Carrera Familiar 3K por la Comunidad',
    description: 'Carrera recreativa con estaciones de hidratación, registro de participantes y cierre musical.',
    category: 'deportes',
    date: '2026-08-08',
    time: '06:30',
    endTime: '10:00',
    location: 'Entrada de Playa Langosta, Cancún',
    city: 'Cancún',
    lat: 21.1436,
    lng: -86.7854,
    organizer: 'BiciRed Cancún',
    organizerId: 'org009',
    image: '🏃',
    maxCapacity: 220,
    enrolled: 103,
    points: 50,
    status: 'active',
    impact: 'Actividad física familiar',
    difficulty: 'Activo',
    tags: ['carrera', 'familia', 'playa']
  },
  {
    id: 'ev032',
    title: 'Orientación Legal Básica',
    description: 'Módulo ciudadano para orientar sobre trámites, quejas, derechos de consumo y acceso a servicios.',
    category: 'derechos',
    date: '2026-08-10',
    time: '10:00',
    endTime: '14:00',
    location: 'Parque de las Palapas, Cancún',
    city: 'Cancún',
    lat: 21.1619,
    lng: -86.8515,
    organizer: 'Red Cívica Benito Juárez',
    organizerId: 'org006',
    image: '⚖️',
    maxCapacity: 80,
    enrolled: 28,
    points: 50,
    status: 'active',
    impact: 'Orientación ciudadana accesible',
    difficulty: 'Ligero',
    tags: ['derechos', 'legal', 'trámites']
  },
  {
    id: 'ev033',
    title: 'Limpieza de Cenote Urbano',
    description: 'Retiro de residuos, registro fotográfico y sensibilización sobre cuerpos de agua urbanos.',
    category: 'medioambiente',
    date: '2026-08-12',
    time: '07:30',
    endTime: '12:30',
    location: 'Cenote Urbano en Región 230, Cancún',
    city: 'Cancún',
    lat: 21.1945,
    lng: -86.8734,
    organizer: 'Mar Limpio Cancún',
    organizerId: 'org001',
    image: '💧',
    maxCapacity: 65,
    enrolled: 25,
    points: 80,
    status: 'active',
    impact: 'Protección de cuerpos de agua urbanos',
    difficulty: 'Activo',
    tags: ['cenote', 'limpieza', 'agua']
  },
  {
    id: 'ev034',
    title: 'Festival de Juegos Tradicionales',
    description: 'Tarde comunitaria con juegos tradicionales, registro de equipos y actividades para familias.',
    category: 'deportes',
    date: '2026-08-15',
    time: '16:00',
    endTime: '20:00',
    location: 'Parque del Crucero, Cancún',
    city: 'Cancún',
    lat: 21.1714,
    lng: -86.8499,
    organizer: 'Deporte Comunitario Cancún',
    organizerId: 'org009',
    image: '🪁',
    maxCapacity: 160,
    enrolled: 62,
    points: 35,
    status: 'active',
    impact: 'Convivencia familiar y rescate cultural',
    difficulty: 'Familiar',
    tags: ['juegos', 'familia', 'comunidad']
  }
];

export async function getEvents({ category = null, search = '', limitNum = 50 } = {}) {
  try {
    const { db, collection, getDocs, query, where, orderBy, limit } = await getFirebaseServices();
    let q = collection(db, 'events');
    const constraints = [where('status', '==', 'active'), orderBy('date'), limit(limitNum)];
    if (category && category !== 'all') constraints.push(where('category', '==', category));
    q = query(q, ...constraints);
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (_) {}

  let events = [...SAMPLE_EVENTS, ...readLocalEvents()];
  if (category && category !== 'all') events = events.filter(e => e.category === category);
  if (search) {
    const s = normalize(search);
    events = events.filter(e => normalize([e.title, e.description, e.location, e.organizer, ...(e.tags || [])].join(' ')).includes(s));
  }
  return events.slice(0, limitNum);
}

export async function getEventById(id) {
  try {
    const { db, doc, getDoc } = await getFirebaseServices();
    const snap = await getDoc(doc(db, 'events', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (_) {}
  return [...SAMPLE_EVENTS, ...readLocalEvents()].find(e => e.id === id) || null;
}

export async function createEvent(eventData) {
  const data = {
    ...eventData,
    city: eventData.city || 'Cancún',
    enrolled: 0,
    status: 'active',
    organizer: eventData.organizer || 'Organizador Demo',
    organizerId: eventData.organizerId || 'demo',
    createdAt: new Date()
  };

  try {
    const services = await getFirebaseServices();
    const docRef = await services.addDoc(services.collection(services.db, 'events'), {
      ...data,
      createdAt: services.serverTimestamp(),
      updatedAt: services.serverTimestamp()
    });
    return docRef.id;
  } catch (_) {
    const localEvent = { id: generateId(), ...data };
    const events = readLocalEvents();
    events.unshift(localEvent);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    return localEvent.id;
  }
}

export async function updateEvent(id, updates) {
  try {
    const { db, doc, updateDoc, serverTimestamp } = await getFirebaseServices();
    await updateDoc(doc(db, 'events', id), { ...updates, updatedAt: serverTimestamp() });
  } catch (_) {
    const events = readLocalEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...updates };
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    }
  }
}

export async function deleteEvent(id) {
  try {
    const { db, doc, deleteDoc } = await getFirebaseServices();
    await deleteDoc(doc(db, 'events', id));
  } catch (_) {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(readLocalEvents().filter(e => e.id !== id)));
  }
}

export async function enrollInEvent(eventId) {
  try {
    const { db, auth, collection, doc, addDoc, updateDoc, serverTimestamp, arrayUnion, increment } = await getFirebaseServices();
    const user = auth.currentUser;
    if (!user) throw new Error('No user');
    await addDoc(collection(db, 'events', eventId, 'enrollments'), {
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      enrolledAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'events', eventId), { enrolled: increment(1) });
    await updateDoc(doc(db, 'users', user.uid), {
      eventsJoined: arrayUnion(eventId),
      updatedAt: serverTimestamp()
    });
  } catch (_) {
    const joined = readJoinedEvents();
    if (!joined.includes(eventId)) joined.push(eventId);
    saveJoinedEvents(joined);
    syncDemoSessionEvents(joined);
  }
}

export async function unenrollFromEvent(eventId) {
  try {
    const { db, auth, doc, updateDoc, arrayRemove, increment } = await getFirebaseServices();
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { eventsJoined: arrayRemove(eventId) });
    await updateDoc(doc(db, 'events', eventId), { enrolled: increment(-1) });
  } catch (_) {
    const joined = readJoinedEvents().filter(id => id !== eventId);
    saveJoinedEvents(joined);
    syncDemoSessionEvents(joined);
  }
}

export async function getUserEvents(uid) {
  try {
    const { db, collection, getDocs, query, where } = await getFirebaseServices();
    const q = query(collection(db, 'events'), where('organizerId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (_) {
    return [...SAMPLE_EVENTS, ...readLocalEvents()].filter(e => e.organizerId === uid || e.organizerId === 'demo');
  }
}

export { SAMPLE_EVENTS, EVENT_CATEGORY_META };

async function getFirebaseServices() {
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = Promise.all([
      import('./firebase-config.js'),
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js")
    ]).then(([config, firestore]) => ({
      db: config.db,
      auth: config.auth,
      ...firestore
    }));
  }
  return firebaseServicesPromise;
}

function readLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function readDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY));
  } catch (_) {
    return null;
  }
}

function joinedEventsKey() {
  const session = readDemoSession();
  return `civiconnect_demo_joined_${session?.uid || 'guest'}`;
}

function readJoinedEvents() {
  try {
    return JSON.parse(localStorage.getItem(joinedEventsKey()) || '[]');
  } catch (_) {
    return [];
  }
}

function saveJoinedEvents(joined) {
  localStorage.setItem(joinedEventsKey(), JSON.stringify([...new Set(joined)]));
}

function syncDemoSessionEvents(joined) {
  const session = readDemoSession();
  if (!session) return;
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
    ...session,
    eventsJoined: [...new Set(joined)]
  }));
}

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
