const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = users.find(user => user.username === request.headers.username)

	if (!user) {
		return response.status(404).json({ error: 'User not found.' })
	}

  request.user = user
	
	return next()
}

function checkExistsTodo(request, response, next) {
	const { id } = request.params
	
	if (!request.user.todos.find(todo => todo.id === id)) {
		return response.status(404).json({ error: 'Todo not found.' })
	}
	
	return next()
}

app.post('/users', (request, response) => {
	const { name, username } = request.body
	
	if (users.find(user => user.username === username)) {
		return response.status(400).json({ error: 'User already exists.' })
	}
	
	const user = {
		id: uuidv4(),
		name,
		username,
		todos: []
	}
	
	users.push(user)
	
	return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	return response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body
	
	const todo = {
		id: uuidv4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	}
	
	request.user.todos.push(todo)
	
	return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
	const { id } = request.params
	const { title, deadline } = request.body
	
	const todo = request.user.todos.find(t => t.id === id)
	
	todo.title = title
	todo.deadline = new Date(deadline)
	
	return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
	const { id } = request.params
	
	const todo = request.user.todos.find(t => t.id === id)
	
	todo.done = true
	
	return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { id } = request.params

  const index = request.user.todos.findIndex(todo => todo.id === id)

  request.user.todos.splice(index, 1)

  return response.sendStatus(204)
});

module.exports = app;