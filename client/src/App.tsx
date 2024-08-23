import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplePage from "./SimplePage";
import SuccesPage from './SuccesPage'; 
import PrivateRoute from './PrivateRoute';
import { AuthUtil } from './AuthUse';

//AuthUtil help to get access to authContext
function App() {
  return (
    <AuthUtil> 
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
    </AuthUtil>
  );
}

export default App;
