import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { type Language } from './types/i18n';
import Home from './components/Home';
import TableSample from './components/TableSample';
import Table from './components/Table';
import ActionButtonClient from './components/testcase/ActionButtonClient';
import './App.css';
import CustomSelectTest from './components/testcase/CustomSelectTest'
import GroupedStickyTableDemo from './components/Table2';
import GroupByCondition from './components/GroupByCondition';
import Demo from './Demo' ;
import {groupColumnsOptions} from './utils/mockData';

function App() {
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>('zh'); //默认语言设为中文(影响按钮上文字等)
  return (
    <LanguageProvider 
      defaultLanguage={currentLanguage}
    >
    <Router>
      <div className="app">
        {/* <nav className="nav-bar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📊 Table Component App
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">首页</Link>
              <Link to="/table" className="nav-link">表格示例</Link>
              <Link to="/demo" className="nav-link">Demo</Link>
              <Link to="/actionButtonClient" className="nav-link">按钮区组件示例</Link>  
              <Link to="/customSelectTest" className="nav-link">customSelectTest</Link>  
              <Link to="/table2" className="nav-link">table2</Link>  
              <Link to="/groupByCondition" className="nav-link">groupByCondition</Link>  
              <InputNumber defaultValue={100}></InputNumber>                       
            </div>
          </div>
        </nav> */}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tableSample" element={<TableSample />} />
            <Route path="/table" element={<Table />} />
            <Route path="/actionButtonClient" element={<ActionButtonClient />} />
            <Route path="/customSelectTest" element={<CustomSelectTest />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/table2" element={<GroupedStickyTableDemo />} />
            <Route path="/groupByCondition" element={<GroupByCondition columnsOptions={()=>{return Promise.resolve(groupColumnsOptions)}}/>} />
          </Routes>
        </main>

        {/* <footer className="footer">
          <p>&copy; 2024 React + Vite + TypeScript + React Router 示例</p>
        </footer> */}
      </div>
    </Router>
    </LanguageProvider>
  );
}

export default App;
