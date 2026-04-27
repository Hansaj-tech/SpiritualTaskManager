/**
 * Seed Firestore with initial config data.
 *
 * Usage:
 *   node scripts/seed-firestore.js
 *
 * Requires FIREBASE_ADMIN_* environment variables to be set (or use Firebase emulator).
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

// Support emulator
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST

if (useEmulator) {
  console.log('Using Firestore emulator at', useEmulator)
  process.env.FIRESTORE_EMULATOR_HOST = useEmulator
}

initializeApp(
  projectId && clientEmail && privateKey
    ? { credential: cert({ projectId, clientEmail, privateKey }) }
    : { projectId: projectId || 'demo-project' }
)

const db = getFirestore()

const DEFAULT_ACTIVITIES = {
  'morning-aarti':         { id: 'morning-aarti',         name: 'Morning Aarti',           order: 1,  points: 10 },
  'evening-aarti':         { id: 'evening-aarti',         name: 'Evening Aarti',           order: 2,  points: 10 },
  'mansi-1':               { id: 'mansi-1',               name: '1st Mansi',               order: 3,  points: 10 },
  'mansi-2':               { id: 'mansi-2',               name: '2nd Mansi',               order: 4,  points: 10 },
  'mansi-3':               { id: 'mansi-3',               name: '3rd Mansi',               order: 5,  points: 10 },
  'vachnamrut-vanchan':    { id: 'vachnamrut-vanchan',    name: 'Vachnamrut Vanchan',      order: 6,  points: 10 },
  'swamini-vato-vanchan':  { id: 'swamini-vato-vanchan',  name: 'Swamini Vato Nu Vanchan', order: 7,  points: 10 },
  'nitya-prerna-shravan':  { id: 'nitya-prerna-shravan',  name: 'Nitya Prerna Shravan',    order: 8,  points: 10 },
  'chesta':                { id: 'chesta',                name: 'Chesta',                  order: 9,  points: 10 },
  'pooja':                 { id: 'pooja',                 name: 'Pooja',                   order: 10, points: 10 },
}

const ADMIN_EMAIL = 'jalkirhan@gmail.com'

async function seed() {
  console.log('Seeding Firestore...')

  // config/activities
  await db.collection('config').doc('activities').set({ activities: DEFAULT_ACTIVITIES })
  console.log('✓ config/activities seeded')

  // config/app
  await db.collection('config').doc('app').set({
    dailyQuote: 'Hari Swa Chhe - God is ever present within you.',
    guruImages: [],
    updatedAt: new Date(),
  })
  console.log('✓ config/app seeded')

  // Grant admin to jalkirhan@gmail.com if their user doc already exists
  const usersSnap = await db.collection('users').where('email', '==', ADMIN_EMAIL).limit(1).get()
  if (!usersSnap.empty) {
    await usersSnap.docs[0].ref.update({ isAdmin: true })
    console.log(`✓ isAdmin granted to ${ADMIN_EMAIL}`)
  } else {
    console.log(`ℹ  ${ADMIN_EMAIL} not found yet — log in first, then re-run this script OR`)
    console.log('   manually set isAdmin: true in Firestore Console → users → {your-uid}')
  }

  console.log('\nDone!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
