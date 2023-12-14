import {
  useQuery,
  useMutation,
  useQueryClient,
} from 'react-query'
import axios from 'axios';
import reactLogo from './assets/loco.svg'
import './App.css'
import { Routes, Route, Outlet, Link } from "react-router-dom";

import { useState } from "react";

export default function App() {

  return (
    <div>
      <h1>Loco Todo List</h1>
      <Routes >
        <Route path="/" element={<Layout />}>
          <Route index element={<TodoList />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  )
}


function Layout() {
  return (
    <div>
      <div>
        <a href="https://loco.rs" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo" alt="Loco logo" />
        </a>
      </div>
      <hr />
      <Outlet />
    </div>
  );
}

function TodoList() {

  const queryClient = useQueryClient();

  const fetchTodos = async () => {
    const { data } = await axios.get(`http://127.0.0.1:3000/api/notes`)
    return data;
  }

  const { isLoading, isError, data = [] } = useQuery(["todos"], fetchTodos); // a hook provided by react-query, it takes a key(name) and function that returns a promise


  const remove = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:3000/api/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error posting todo:', error);
      throw error;
    }
  };


  const mutation = useMutation(remove, {
    onSuccess: () => {
      queryClient.invalidateQueries(["todos"]);
    },
  });

  console.log(data)
  if (isLoading)
    return (
      <div className="App">
        <p>isLoading...</p>
      </div>
    );

  if (isError)
    return (
      <div className="App">
        <p>Could not get todo list from the server</p>
      </div>
    );


  return (
    <div>
      <AddTodo />
      <div className="todo-list">
        {data.map((todo) => (
          <div key={todo.id} className="todo" >
            <div>
              <div> <button onClick={() => {
                mutation.mutate(todo.id);
              }}>x</button> {todo.title}</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}


function AddTodo() {
  const [todo, setTodo] = useState("");
  const queryClient = useQueryClient();

  const add = async (newTodo) => {
    try {
      const response = await axios.post(`http://127.0.0.1:3000/api/notes`, {
        title: newTodo,
        content: newTodo,
      });
      return response.data;
    } catch (error) {
      console.error('Error posting todo:', error);
      throw error;
    }
  };


  const mutation = useMutation(add, {
    onSuccess: () => {
      setTodo("")
      queryClient.invalidateQueries(["todos"]);
    },
  });

  return (
    <div className='todo-add'>
      <input
        value={todo}
        onChange={(event) => {
          setTodo(event.target.value);
        }}
        type="text"
      />
      <button
        onClick={() => {
          if (todo !== "") {
            mutation.mutate(todo);
          }
        }}
      >
        Add
      </button>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Sorry, this page not found</h2>
      <p>
        <Link to="/">Go to the todo list page</Link>
      </p>
    </div>
  );
}
