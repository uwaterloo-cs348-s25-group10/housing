import React, { useEffect, useRef, useState } from "react";
import { apiClient } from "../config/api";
import mapboxgl from "mapbox-gl";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function HeatmapPage() {
  const mapContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [geojson, setGeojson] = useState(null);

  // 🔄 Fun facts to show while loading
  const funFacts = [
    "🏠 The average home price in Toronto exceeds $1 million!",
    "🌇 Vancouver is one of the least affordable cities in the world.",
    "📈 Housing prices in Canada grew over 50% in the last decade.",
    "🛠️ In some cities, laneway homes are used to add affordable housing.",
    "🌍 Canada's population has grown rapidly due to immigration, affecting housing demand.",
    "📊 The Housing Affordability Index compares income to mortgage cost.",
    "🏗️ The CMHC helps finance affordable housing across Canada.",
  ];

  const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setFactIndex((prevIndex) => (prevIndex + 1) % funFacts.length);
      }, 3000); // rotate every 3s
      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    apiClient
      .get("/heatmap?grid_size=0.1&price_threshold=300000")
      .then((data) => setGeojson(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!geojson) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [-79.38, 43.65],
      zoom: 5,
    });

    map.on("load", () => {
      map.addSource("heatmap-points", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "heatmap-layer",
        type: "circle",
        source: "heatmap-points",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            1,
            4,
            20,
            16,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "avg_price"],
            300000,
            "#fee08b",
            1000000,
            "#d73027",
          ],
          "circle-opacity": 0.8,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#333",
        },
      });

      map.on("click", "heatmap-layer", (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<b>Listings:</b> ${props.count}<br><b>Avg Price:</b> $${parseInt(
              props.avg_price
            ).toLocaleString()}`
          )
          .addTo(map);
      });

      map.on("mouseenter", "heatmap-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "heatmap-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, [geojson]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Housing Hotspots Map
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This map visualizes regions with high housing sale density and average
        prices.
      </Typography>

      <Paper elevation={3} sx={{ height: 600, position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              zIndex: 1000,
              backdropFilter: "blur(2px)",
              backgroundColor: "rgba(255,255,255,0.4)",
              textAlign: "center",
              px: 2,
            }}
          >
            <CircularProgress />
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 300 }}
              >
                {funFacts[factIndex]}
              </Typography>
            </Box>
          </Box>
        )}

        <Box ref={mapContainer} sx={{ height: "100%", width: "100%" }} />

        {!loading && (
          <Paper
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              px: 2,
              py: 1,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              🟠 Hotspot Legend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bigger = more listings, Redder = higher price
            </Typography>
            <Box
              sx={{
                mt: 1,
                width: 200,
                height: 10,
                borderRadius: 4,
                background: "linear-gradient(to right, #fee08b, #d73027)",
              }}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}
            >
              <Typography fontSize={12}>300K</Typography>
              <Typography fontSize={12}>1M+</Typography>
            </Box>
          </Paper>
        )}
      </Paper>
    </Container>
  );
}
