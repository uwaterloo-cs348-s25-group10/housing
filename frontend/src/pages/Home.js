import React from "react";
import canadaImage from "../assets/homepage-thumbnail.png";
import "./Home.css";
import { apiClient } from "../config/api";

const Home = () => {
  const handleImportData = async () => {
    try {
      await apiClient.post('/import-data?random_year=True')
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <main className="home-container">
      <div className="home-text">
        <h1>
          Where Can You Actually
          <br />
          Afford to Live?
        </h1>
        <p>
          Discover Where You Can Afford to Live in Canada. <br />
          Use historical data to explore housing trends, compare income levels,
          and find affordable regions tailored to you.
        </p>
        <button className="explore-button" onClick={handleImportData}>Import Data</button>
        <a href="/data-gaps" style={{ textDecoration: "none" }}>
          <button className="explore-button" style={{ marginLeft: "1rem" }}>Find Data Gaps</button>
        </a>
        <a href="/monthly-summary" style={{ textDecoration: "none" }}>
          <button className="explore-button" style={{ marginLeft: "1rem" }}>Monthly Summary</button>
        </a>
      </div>

      <div className="home-image">
        <img src={canadaImage} alt="Canada" />
      </div>
    </main>
  );
};

export default Home;
