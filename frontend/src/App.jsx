import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ViewTasks from './view/ViewTasks';
import AddTask from './controller/AddTask';
import ViewTaskDetails from './view/ViewTaskDetails';
import RemoveTask from './controller/RemoveTask';
import ViewTasksChart from './view/ViewTasksChart';
import Login from './layout/Login';
import Register from './layout/Register';
import PrivateRoute from './controller/PrivateRoute';
import DrawingCanvas from './DrawingCanvas';
import ViewPrivateTasks from './view/ViewPrivateTasks';
import InfiniteCanvas from './view/InfiniteCanvas';
import Dashboard from './view/Dashboard';
import RemoveUser from './controller/RemoveUser';
import ChangeRole from './controller/ChangeRole';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchRole = async () => {
        try {
          const res = await axios.get('/api/getRole');
          const role = res.data;
          console.log(role);
          if (role === 'Admin') {
            setIsAdmin(true);
          }
          if (role === 'Manager') {
            setIsManager(true);
          }
        } catch (error) {
          console.error('Error fetching role:', error);
        } finally {
          setLoading(false);
        }
  
      };

      fetchRole();

    },[]);
  const Home = () => {
    
    return (
      <div className="app-container">
        <h1 className="welcome-message">Welcome</h1>
        <nav>
          <Link to="/tasks/view_private">View private tasks</Link>
          <Link to="/tasks/view">View public tasks</Link>
          <Link to="/tasks/add">Add tasks</Link>
          {/* <Link to="/profile">Profile</Link> */}
          { (isAdmin || isManager) && (<Link to="/dashboard">Dashboard</Link>) }
          <Link to="/tasks/infinite_canvas">Infinite Canvas</Link>
        </nav>
        <ViewTasksChart />
        <DrawingCanvas />
      </div>
    );
  };

  if(loading) {
    return <div>Loading...</div>;
  }
  else {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute />}>
          { (isAdmin || isManager) && (<Route path="/dashboard" element={<Dashboard />} />) }
          <Route path="/tasks" element={<Home />} />
          <Route path="/tasks/view" element={<ViewTasks />} />
          <Route path="/tasks/view_private" element={<ViewPrivateTasks />} />
          <Route path="/tasks/add" element={<AddTask />} />
          <Route path="/tasks/:id" element={<ViewTaskDetails />} />
          <Route path="/tasks/delete/:id" element={<RemoveTask />} />
          <Route path="/tasks/infinite_canvas" element={<InfiniteCanvas />} />
          <Route path="/users/delete/:id" element={<RemoveUser />} />
          <Route path="/dashboard/role/:id" element={<ChangeRole />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );}
}

export default App;
