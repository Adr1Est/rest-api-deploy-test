const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors') //npm install cors -E
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json()) // Para poder acceder a req.body
app.use(cors({ //middleware CORS arregla los errores de CORS, por defecto utiliza '*'
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://127.0.0.1:5500',
      'http://movies.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

// TODOS los recursos que sean MOVIES se identifica con /movies
// También filtra por género usando query strings ?
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) { // Si hay query string pasa por aquí
    // const filteredMovies = movies.filter(movie => movie.genre.includes(genre))  <== Esto sería sensible a mayusculas/minusculas
    // Usamos filter() e includes() por que genre en el JSON es un array
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())) // No importan mayusculas/minusculas

    return res.json(filteredMovies) // SALIDA
  }
  res.json(movies)
})

// endpoint :id segmento dinámico
app.get('/movies/:id', (req, res) => { // path-to-regexp: biblioteca que crea la regex desde una ruta dada
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id) // Captura la película en función del id dado
  if (movie) return res.json(movie) // Si encuentra la peli la muestra

  res.status(404).json({ message: 'Movie not found' })
})

// Crear una pelicula usando POST
app.post('/movies', (req, res) => {
  // VALIDANDO LOS DATOS CON EL SCHEMA Y LA FUNCIÓN CREADOS EN ./schemas/movies.js
  const result = validateMovie(req.body)

  if (result.error) {
    // 400 Bad Request o 422 Unprocesable Entity
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), //uuid v4
    ...result.data
  }

  //Esto no sería REST por que estamos guardando el estado de la aplicación en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie) // actualizar la cache del cliente; status 201 por que indica recurso creado
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // buscar el indice en el array de películas una vez obtenido el id
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  // manejar error
  if (movieIndex === -1) { // Si el index es -1 es que no se ha encontrado
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`servidor escuchando en http://localhost:${PORT}`)
})
