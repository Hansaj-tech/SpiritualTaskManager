import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { splitIntoPortions } from '@/lib/vanchan-split'

const ALLOWED_ACTIVITY_IDS = new Set(['vachnamrut-vanchan', 'swamini-vato-vanchan'])

function portionDocId(index: number): string {
  return String(index).padStart(4, '0')
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await adminAuth().verifyIdToken(idToken)
    const callerSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (!callerSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const form = await request.formData()
    const activityId = String(form.get('activityId') ?? '')
    const title = String(form.get('title') ?? '').trim()
    const wordsPerPortion = Number(form.get('wordsPerPortion') ?? 900)
    const file = form.get('file')

    if (!ALLOWED_ACTIVITY_IDS.has(activityId)) {
      return NextResponse.json({ error: 'Invalid activityId' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 })
    }
    if (!Number.isFinite(wordsPerPortion) || wordsPerPortion < 100) {
      return NextResponse.json({ error: 'wordsPerPortion must be at least 100' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    let extractedText: string
    try {
      const result = await parser.getText()
      extractedText = result.text
    } finally {
      await parser.destroy()
    }

    const portions = splitIntoPortions(extractedText, wordsPerPortion)
    if (portions.length === 0) {
      return NextResponse.json({ error: 'No extractable text found in that PDF' }, { status: 422 })
    }

    const bookRef = adminDb().collection('vanchanBooks').doc(activityId)

    // Clear any existing portions from a previous upload before writing new ones.
    const existingPortions = await bookRef.collection('portions').listDocuments()
    for (let i = 0; i < existingPortions.length; i += 400) {
      const chunk = existingPortions.slice(i, i + 400)
      const batch = adminDb().batch()
      chunk.forEach((ref) => batch.delete(ref))
      await batch.commit()
    }

    for (let i = 0; i < portions.length; i += 400) {
      const chunk = portions.slice(i, i + 400)
      const batch = adminDb().batch()
      chunk.forEach((text, offset) => {
        const index = i + offset
        batch.set(bookRef.collection('portions').doc(portionDocId(index)), {
          index,
          text,
          updatedAt: FieldValue.serverTimestamp(),
        })
      })
      await batch.commit()
    }

    await bookRef.set({
      activityId,
      title,
      totalPortions: portions.length,
      sourceFileName: file.name,
      uploadedAt: FieldValue.serverTimestamp(),
      uploadedBy: decoded.email ?? decoded.uid,
    })

    return NextResponse.json({ ok: true, totalPortions: portions.length })
  } catch (err) {
    console.error('vanchan upload error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
