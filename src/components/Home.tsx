import React from 'react';
import { Link } from 'react-router-dom';
import './Home.module.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <header className="home-header">
        <h1>🏠 欢迎来到首页</h1>
        <p>这是一个使用 React Router 的示例应用</p>
      </header>
      
      <section className="features">
        <h2>项目特性</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>⚛️ React 18</h3>
            <p>使用最新的 React 版本，支持并发特性</p>
          </div>
          <div className="feature-card">
            <h3>📝 TypeScript</h3>
            <p>类型安全的开发体验</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Vite</h3>
            <p>极速的开发服务器和构建工具</p>
          </div>
          <div className="feature-card">
            <h3>🛣️ React Router</h3>
            <p>强大的客户端路由解决方案</p>
          </div>
        </div>
      </section>
      
      <section className="navigation">
        <h2>导航示例</h2>
        <div className="nav-buttons">
          <Link to="/hello" className="nav-button">
            👋 访问 Hello World 页面
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;