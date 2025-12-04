const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3000;

const os = require('os');

// Create a dedicated uploads directory in the system's temp folder
const uploadsDir = path.join(os.tmpdir(), 'seguridad_uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
// Serve uploaded files from the system's temp directory
app.use('/uploads', express.static(uploadsDir));


const guardsFilePath = path.join(__dirname, 'src', 'assets', 'guards.json');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- API Endpoints ---

// POST: Upload a guard's photo
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }
  // Return the path where the file was saved
  // The path should be relative to the domain root so the frontend can use it
  const filePath = `/uploads/${req.file.filename}`;
  // --- DIAGNOSTIC LOG ---
  console.log('Archivo guardado en:', filePath);
  res.status(200).json({ message: 'Archivo subido correctamente.', filePath: filePath });
});


// GET: Obtener todos los guardias
app.get('/api/guards', (req, res) => {
  fs.readFile(guardsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading guards.json:', err);
      return res.status(500).json({ message: 'Error al leer los datos de los guardias.' });
    }
    try {
      const guards = JSON.parse(data);
      res.json(guards);
    } catch (parseErr) {
      console.error('Error parsing guards.json:', parseErr);
      res.status(500).json({ message: 'Error en el formato de los datos de los guardias.' });
    }
  });
});

// GET: Obtener un guardia por ID
app.get('/api/guards/:idEmpleado', (req, res) => {
  fs.readFile(guardsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading guards.json:', err);
      return res.status(500).json({ message: 'Error al leer los datos de los guardias.' });
    }
    try {
      const guards = JSON.parse(data);
      const guard = guards.find(g => g.idEmpleado == req.params.idEmpleado);
      if (guard) {
        res.json(guard);
      } else {
        res.status(404).json({ message: 'Guardia no encontrado.' });
      }
    } catch (parseErr) {
      console.error('Error parsing guards.json:', parseErr);
      res.status(500).json({ message: 'Error en el formato de los datos de los guardias.' });
    }
  });
});

// POST: Registrar un nuevo guardia
app.post('/api/guards', (req, res) => {
  const newGuard = req.body;

  // Validación simple en el backend
  if (!newGuard || !newGuard.nombre || !newGuard.idEmpleado) {
    return res.status(400).json({ message: 'Faltan datos del nuevo guardia.' });
  }

  fs.readFile(guardsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading guards.json before writing:', err);
      return res.status(500).json({ message: 'Error al leer los datos existentes.' });
    }
    
    try {
      const guards = JSON.parse(data);
      guards.push(newGuard);

      fs.writeFile(guardsFilePath, JSON.stringify(guards, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing to guards.json:', writeErr);
          return res.status(500).json({ message: 'Error al guardar el nuevo guardia.' });
        }
        res.status(201).json({ message: 'Guardia registrado correctamente.', guard: newGuard });
      });
    } catch (parseErr) {
      console.error('Error parsing guards.json before writing:', parseErr);
      res.status(500).json({ message: 'Error en el formato de los datos existentes.' });
    }
  });
});

// PATCH: Actualizar un guardia (por ejemplo, la foto)
app.patch('/api/guards/:idEmpleado', (req, res) => {
  const guardIdToUpdate = req.params.idEmpleado;
  const updatedData = req.body;

  fs.readFile(guardsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer los datos.' });
    }
    
    try {
      let guards = JSON.parse(data);
      const guardIndex = guards.findIndex(g => g.idEmpleado == guardIdToUpdate);

      if (guardIndex === -1) {
        return res.status(404).json({ message: 'Guardia no encontrado para actualizar.' });
      }

      // Merge existing data with new data
      guards[guardIndex] = { ...guards[guardIndex], ...updatedData };
      
      fs.writeFile(guardsFilePath, JSON.stringify(guards, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ message: 'Error al guardar los datos actualizados.' });
        }
        res.status(200).json(guards[guardIndex]);
      });
    } catch (parseErr) {
      res.status(500).json({ message: 'Error en el formato de los datos existentes.' });
    }
  });
});

// DELETE: Eliminar un guardia por ID
app.delete('/api/guards/:idEmpleado', (req, res) => {
  const guardIdToDelete = req.params.idEmpleado;

  fs.readFile(guardsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading guards.json:', err);
      return res.status(500).json({ message: 'Error al leer los datos de los guardias.' });
    }

    try {
      let guards = JSON.parse(data);
      const initialLength = guards.length;
      guards = guards.filter(guard => guard.idEmpleado !== guardIdToDelete);

      if (guards.length === initialLength) {
        return res.status(404).json({ message: 'Guardia no encontrado.' });
      }

      fs.writeFile(guardsFilePath, JSON.stringify(guards, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing to guards.json:', writeErr);
          return res.status(500).json({ message: 'Error al eliminar el guardia.' });
        }
        res.status(200).json({ message: 'Guardia eliminado correctamente.' });
      });
    } catch (parseErr) {
      console.error('Error parsing guards.json:', parseErr);
      res.status(500).json({ message: 'Error en el formato de los datos existentes.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${port}`);
});
