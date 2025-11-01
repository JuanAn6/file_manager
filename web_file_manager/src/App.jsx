import { Routes, Route, Link } from 'react-router-dom';
// import Home from './components/Home'; // Asegúrate de crear estos componentes
// import About from './components/About'; 

function App() {
  return (
    <div>
      {/* Barra de Navegación con Link */}
      <nav>
        <Link to="/">Inicio</Link> | 
        <Link to="/acerca">Acerca de</Link>
      </nav>
      <hr />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/acerca" element={<About />} /> */}
        {/* Ruta para manejar errores o páginas no encontradas */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </div>
  );
}

export default App;