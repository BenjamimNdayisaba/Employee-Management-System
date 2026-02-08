import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Components/Login'
import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Home from './Components/Home'
import Employee from './Components/Employee'
import Category from './Components/Category'
import Profile from './Components/Profile'
import AddCategory from './Components/AddCategory'
import AddEmployee from './Components/AddEmployee'
import EditEmployee from './Components/EditEmployee'
import Start from './Components/Start'
import EmployeeLogin from './Components/EmployeeLogin'
import AdminRegister from './Components/AdminRegister'
import EmployeeDetail from './Components/EmployeeDetail'
import PrivateRoute from './Components/PrivateRoute'
import ProductivityHub from './Components/ProductivityHub'
import Tasks from './Components/Tasks'
import Submissions from './Components/Submissions'
import EmployeeDashboard from './Components/EmployeeDashboard'
import EmployeeProductivityHub from './Components/EmployeeProductivityHub'
import EmployeeTasks from './Components/EmployeeTasks'
import EmployeeSubmissions from './Components/EmployeeSubmissions'
import EmployeeProfile from './Components/EmployeeProfile'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<AdminRegister />}></Route>
      <Route path='/home' element={<Start />}></Route>
      <Route path='/adminlogin' element={<Login />}></Route>
      <Route path='/employee_login' element={<EmployeeLogin />}></Route>
      <Route path='/employee_detail/:id' element={<EmployeeDetail />}>
        <Route path='' element={<EmployeeDashboard />}></Route>
        <Route path='hub' element={<EmployeeProductivityHub />}></Route>
        <Route path='tasks' element={<EmployeeTasks />}></Route>
        <Route path='submissions' element={<EmployeeSubmissions />}></Route>
        <Route path='profile' element={<EmployeeProfile />}></Route>
      </Route>
      <Route path='/dashboard' element={
        <PrivateRoute >
          <Dashboard />
        </PrivateRoute>
      }>
        <Route path='' element={<Home />}></Route>
        <Route path='/dashboard/employee' element={<Employee />}></Route>
        <Route path='/dashboard/category' element={<Category />}></Route>
        <Route path='/dashboard/profile' element={<Profile />}></Route>
        <Route path='/dashboard/add_category' element={<AddCategory />}></Route>
        <Route path='/dashboard/add_employee' element={<AddEmployee />}></Route>
        <Route path='/dashboard/edit_employee/:id' element={<EditEmployee />}></Route>
        <Route path='/dashboard/hub' element={<ProductivityHub />}></Route>
        <Route path='/dashboard/tasks' element={<Tasks />}></Route>
        <Route path='/dashboard/submissions' element={<Submissions />}></Route>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
