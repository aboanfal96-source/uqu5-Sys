import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'requests.json')

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return []
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } catch { return [] }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export async function PATCH(request, { params }) {
  const body = await request.json()
  const requests = readDB()
  const index = requests.findIndex(r => r.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  requests[index] = { ...requests[index], ...body, updatedAt: new Date().toISOString() }
  writeDB(requests)

  return NextResponse.json({ success: true })
}
