const z = require('zod') // para hacer validaciones de datos

//Validación de los datos
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El título debe ser un string',
    required_error: 'El campo título es necesario'
  }),
  year: z.number().int().positive().min(1900).max(2024), // que sea número entero positivo entre ese rango
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'El poster debe ser una url válida'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'])
  )
})

function validateMovie(object) {
  return movieSchema.safeParse(object) // safeParse permite ver si lo que hay son datos o un error y manejar ese error con un if donde imporemos la función
}

function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object) // partial hace que todas la propiedades en movieSchema sean opcionales, pero si está la que vamos a cambiar, la validará
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
