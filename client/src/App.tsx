import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplePage from "./SimplePage";
import SuccesPage from './SuccesPage'; 
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplePage />} />
        <Route 
          path="/SuccesPage" 
          element={
            <PrivateRoute>
              <SuccesPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
