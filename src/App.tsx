import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}

// Composants de pages
function Home() {
  return (
    <div>
      <h1>Page d'accueil</h1>
      <p>Bienvenue sur mon application React avec Router !</p>
    </div>
  )
}

function About() {
  return (
    <div>
      <h1>À propos</h1>
      <p>Cette page utilise React Router pour la navigation.</p>
    </div>
  )
}

function Contact() {
  return (
    <div>
      <h1>Contact</h1>
      <p>Page de contact de l'application.</p>
    </div>
  )
}

export default App
