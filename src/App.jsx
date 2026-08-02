import { useReveal } from "./useReveal.js";
import StarField from "./components/StarField3D.jsx";
import ScrollIndicator from "./components/ScrollIndicator.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Services from "./components/Services.jsx";
import Apps from "./components/Apps.jsx";
import Why from "./components/Why.jsx";
import Stats from "./components/Stats.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import "./app.css";

export default function App() {
  useReveal();
  return (
    <>
      <StarField />
      <div className="bg-aura" aria-hidden="true" />
      <div className="bg-dim" aria-hidden="true" />
      <ScrollIndicator />
      <Nav />
      <main>
        <Hero />
        <Services />
        <Apps />
        <Why />
        <Stats />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
