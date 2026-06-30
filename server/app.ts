import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;
const JWT_SECRET = 'super-secret-key';

app.use(cors());
app.use(express.json());

// --- Traffic Signal Background Logic ---
setInterval(async () => {
  try {
    const signals = await prisma.trafficSignal.findMany();
    for (const sig of signals) {
      if (sig.mode === 'MANUAL') continue;

      let newTimer = sig.timer - 1;
      let newState = sig.state;
      
      if (newTimer <= 0) {
        if (sig.state === 'GREEN') {
          newState = 'YELLOW';
          newTimer = 3;
        } else if (sig.state === 'YELLOW') {
          newState = 'RED';
          newTimer = 30;
        } else {
          newState = 'GREEN';
          newTimer = 45;
        }
      }

      await prisma.trafficSignal.update({
        where: { id: sig.id },
        data: { timer: newTimer, state: newState }
      });
    }
  } catch (e) {
    console.error('Signal timer error:', e);
  }
}, 1000);

// --- Auth API ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (user && user.password === password) {
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET);
    return res.json({ token, user: { username: user.username, role: user.role } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '帳號已被使用' });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password, // Reminder: In production, hash this password!
        role
      }
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, username: newUser.username }, JWT_SECRET);
    return res.json({ token, user: { username: newUser.username, role: newUser.role } });
  } catch (e) {
    console.error('Registration error:', e);
    return res.status(500).json({ error: '註冊失敗，請稍後再試' });
  }
});

// --- Incident API ---
app.get('/api/incidents', async (req, res) => {
  const incidents = await prisma.incident.findMany({
    orderBy: { timestamp: 'desc' }
  });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const { locationLat, locationLng, type, description } = req.body;
  const incident = await prisma.incident.create({
    data: {
      locationLat,
      locationLng,
      type,
      description,
      status: 'REPORTED'
    }
  });
  res.json(incident);
});

app.put('/api/incidents/:id/status', async (req, res) => {
  const { status } = req.body;
  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(incident);
});

// --- Signal API ---
app.get('/api/signals', async (req, res) => {
  const signals = await prisma.trafficSignal.findMany();
  res.json(signals);
});

app.put('/api/signals/:id', async (req, res) => {
  const { state, mode, timer } = req.body;
  
  const updateData: any = {};
  if (state !== undefined) updateData.state = state;
  if (mode !== undefined) updateData.mode = mode;
  if (timer !== undefined) updateData.timer = timer;

  const signal = await prisma.trafficSignal.update({
    where: { id: req.params.id },
    data: updateData
  });
  res.json(signal);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
