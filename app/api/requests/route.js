import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'requests.json')

function readDB() {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '[]')
      return []
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } catch {
    return []
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export async function GET() {
  const requests = readDB()
  return NextResponse.json(requests.reverse())
}

export async function POST(request) {
  const body = await request.json()
  const { employeeName, department, requestTitle, requestDescription } = body

  if (!employeeName || !requestTitle || !requestDescription) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const requests = readDB()
  const newRequest = {
    id: Date.now().toString(),
    employeeName,
    department: department || '',
    requestTitle,
    requestDescription,
    status: 'pending',
    adminNotes: '',
    reportContent: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  requests.push(newRequest)
  writeDB(requests)

  return NextResponse.json({ success: true, id: newRequest.id }, { status: 201 })
}
