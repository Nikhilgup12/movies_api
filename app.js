const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const dbpath = path.join(__dirname, 'moviesData.db')
app.use(express.json())
let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is start ')
    })
  } catch (e) {
    console.log(`error : ${e.message}`)
    process.exit(1)
  }
}
initialize()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieName: dbObject.movie_name
  }
};

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `select * from movie`
  const movie = await db.all(getMoviesQuery)
  response.send(movie.map((each) =>  convertDbObjectToResponseObject(each)))
});

app.post('/movies/', async (request, response) => {
  const moviedetails = request.body
  const {directorId, movieName, leadActor} = moviedetails
  const getaddQuery = `insert into movie (director_id,movie_name,lead_actor)
     values (
        '${directorId}',
        '${movieName}',
        '${leadActor}',
        );`

  await db.run(getaddQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `select * from movie where movie_id = ${movieId}`
  const movie = await db.get(getMoviesQuery)
  response.send(movie)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviedetails = request.body
  const {directorId, movieName, leadActor} = moviedetails
  const updateQuery = `update from movie 
    set director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        where movie_id = ${movieId};`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `delete from movie where movie_id = ${movieId}`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

const convertDbObjectToResponseObjectdirector = dbObject => {
  return {
    directoeId: dbObject.director_id,
    directorName:dbObject.director_name
  }
};

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `select * from director`
  const director = await db.all(getDirectorQuery)
  response.send(director.map((each) => convertDbObjectToResponseObjectdirector(each)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesQuery = `select * from movie where director_id = ${directorId}`
  const director = await db.all(getMoviesQuery)
  response.send(director.map((each) =>  convertDbObjectToResponseObject(each)))
})

module.exports = app
