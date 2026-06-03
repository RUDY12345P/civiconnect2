// =============================================
// CiviConnect - events.js
// Eventos demo de Cancún + Firestore opcional
// =============================================

let firebaseServicesPromise = null;

const LOCAL_EVENTS_KEY = 'civiconnect_demo_events';

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
    const joined = JSON.parse(localStorage.getItem('civiconnect_demo_joined') || '[]');
    if (!joined.includes(eventId)) joined.push(eventId);
    localStorage.setItem('civiconnect_demo_joined', JSON.stringify(joined));
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
    const joined = JSON.parse(localStorage.getItem('civiconnect_demo_joined') || '[]');
    localStorage.setItem('civiconnect_demo_joined', JSON.stringify(joined.filter(id => id !== eventId)));
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

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
