import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  TextField,
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
} from "@mui/material";
import { apiClient } from "../config/api";

export default function WhereCanLivePage() {
  const [started, setStarted] = useState(false);

  const [income, setIncome] = useState("");
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [years, setYears] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch metadata on mount
  useEffect(() => {
    apiClient.get("/meta/housing").then((res) => {
      setYears(res.years || []);
      setPropertyTypes(res.property_types || []);
    });
  }, []);

  const handleFind = async () => {
    if (!income || !year || !propertyType) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const params = new URLSearchParams();
      params.append("income", parseFloat(income));
      params.append("year", parseInt(year));
      params.append("property_type", propertyType);

      const res = await apiClient.get(`/where-can-i-live?${params.toString()}`);
      setResults(res);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Find Out Where You Could Have Afforded to Live
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Based on your income and housing preferences, we’ll recommend affordable
        regions using historical HAI data.
      </Typography>

      {!started && (
        <Box mb={4}>
          <Button
            onClick={() => setStarted(true)}
            sx={{
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              color: "white",
              px: 3,
              py: 1.5,
            }}
          >
            Start the Quiz
          </Button>
        </Box>
      )}

      {started && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Stack spacing={3}>
            <TextField
              label="Your total annual income (CAD)"
              type="number"
              fullWidth
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                {propertyTypes.map((pt) => (
                  <MenuItem key={pt} value={pt}>
                    {pt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              onClick={handleFind}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                color: "white",
                px: 3,
                py: 1.5,
              }}
              disabled={loading}
            >
              {loading ? "Finding..." : "Find Affordable Regions"}
            </Button>

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {results.length > 0 && (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Region</TableCell>
                  <TableCell align="right">HAI Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.region}</TableCell>
                    <TableCell align="right">
                      {row.user_hai.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
