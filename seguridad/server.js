const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const os = require('os');

const app = express();
const port = 3000;

// Path to the local guards JSON file
const guardsFilePath = path.join(__dirname, 'src', 'assets', 'guards.json');

// Create a dedicated uploads directory in the system's temp folder
const uploadsDir = path.join(os.tmpdir(), 'seguridad_uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
app.use('/uploads', express.static(uploadsDir));

// --- Helper functions for JSON file ---
const getGuards = () => {
  try {
    const data = fs.readFileSync(guardsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading guards file:', err);
    return [];
  }
};

const saveGuards = (guards) => {
  try {
    fs.writeFileSync(guardsFilePath, JSON.stringify(guards, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing guards file:', err);
    return false;
  }
};

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---

// POST: Upload a guard's photo
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo.' });
  const filePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Archivo subido correctamente.', filePath: filePath });
});

// GET: Obtener todos los guardias
app.get('/api/guards', (req, res) => {
  res.json(getGuards());
});

// GET: Obtener un guardia por ID
app.get('/api/guards/:idEmpleado', (req, res) => {
  const guards = getGuards();
  const guard = guards.find(g => g.idEmpleado === req.params.idEmpleado);
  if (guard) {
    res.json(guard);
  } else {
    res.status(404).json({ message: 'Guardia no encontrado.' });
  }
});

// POST: Registrar un nuevo guardia
app.post('/api/guards', (req, res) => {
  const newGuard = req.body;
  if (!newGuard || !newGuard.nombre || !newGuard.idEmpleado) {
    return res.status(400).json({ message: 'Faltan datos del nuevo guardia.' });
  }
  const guards = getGuards();
  guards.push(newGuard);
  if (saveGuards(guards)) {
    res.status(201).json({ message: 'Guardia registrado correctamente.', guard: newGuard });
  } else {
    res.status(500).json({ message: 'Error al guardar en el archivo JSON.' });
  }
});

// PATCH: Actualizar un guardia
app.patch('/api/guards/:idEmpleado', (req, res) => {
  const guards = getGuards();
  const index = guards.findIndex(g => g.idEmpleado === req.params.idEmpleado);
  if (index !== -1) {
    guards[index] = { ...guards[index], ...req.body };
    if (saveGuards(guards)) {
      res.status(200).json(guards[index]);
    } else {
      res.status(500).json({ message: 'Error al actualizar el archivo JSON.' });
    }
  } else {
    res.status(404).json({ message: 'Guardia no encontrado.' });
  }
});

// DELETE: Eliminar un guardia por ID
app.delete('/api/guards/:idEmpleado', (req, res) => {
  const guards = getGuards();
  const filteredGuards = guards.filter(g => g.idEmpleado !== req.params.idEmpleado);
  if (guards.length !== filteredGuards.length) {
    if (saveGuards(filteredGuards)) {
      res.status(200).json({ message: 'Guardia eliminado correctamente.' });
    } else {
      res.status(500).json({ message: 'Error al eliminar del archivo JSON.' });
    }
  } else {
    res.status(404).json({ message: 'Guardia no encontrado.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${port}`);
});