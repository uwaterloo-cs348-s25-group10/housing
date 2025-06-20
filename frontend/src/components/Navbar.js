import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">O Canada Homes</div>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/housing">Search Historical Housing</Link>
        <Link to="/income">Search Historical Income</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/about">About</Link>
      </nav>

      <Link to="/quiz">
        <button className="quiz-button">Take the Quiz</button>
      </Link>
    </header>
  );
};

export default Navbar;
