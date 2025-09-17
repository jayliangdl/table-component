import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import TableSample from './components/TableSample';
import TableSampleNew2 from './components/TableSample_new2';
import TableSampleNew from './components/TableSample_new';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📊 Table Component App
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">首页</Link>
              <Link to="/table" className="nav-link">表格示例</Link>
              <Link to="/tableNew" className="nav-link">表格示例New</Link>
              <Link to="/tableNew2" className="nav-link">表格示例New</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/table" element={<TableSample />} />
            <Route path="/tableNew" element={<TableSampleNew />} />
            <Route path="/tableNew2" element={<TableSampleNew2 />} />
          </Routes>
        </main>

        {/* <footer className="footer">
          <p>&copy; 2024 React + Vite + TypeScript + React Router 示例</p>
        </footer> */}
      </div>
    </Router>
  );
}

export default App;
