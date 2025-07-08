import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
} from "@mui/material";

const YEARS = Array.from({ length: 21 }, (_, i) => 2000 + i);
const PROPERTY_TYPES = ["House", "Condo", "Apartment"];

// Dummy top‐5 ranking
const DUMMY_RANKING = [
  { region_id: 5, name: "Montreal", hai_index: 21.9 },
  { region_id: 1, name: "Vancouver", hai_index: 21.82 },
  { region_id: 4, name: "Ottawa", hai_index: 21.0 },
  { region_id: 2, name: "Calgary", hai_index: 20.0 },
  { region_id: 3, name: "Toronto", hai_index: 19.2 },
];

export default function AffordabilityRankingPage() {
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    setLoading(true);
    setResults([]);
    // stub: immediately show dummy ranking
    setTimeout(() => {
      setResults(DUMMY_RANKING);
      setLoading(false);
    }, 500);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom align="left">
        Affordability Ranking by Region
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        align="left"
      >
        Select a year and property type to see the top 5 most affordable regions
        (HAI).
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <FormControl size="small" sx={{ flex: "1 1 150px" }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: "1 1 180px" }}>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={propertyType}
              label="Property Type"
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {PROPERTY_TYPES.map((pt) => (
                <MenuItem key={pt} value={pt}>
                  {pt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{ flex: "0 0 140px", height: 40 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Search"
            )}
          </Button>
        </Stack>
      </Paper>

      {results.length > 0 && !loading && (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Region ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">HAI Index</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{row.region_id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">
                      {row.hai_index.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}
    </Container>
  );
}
