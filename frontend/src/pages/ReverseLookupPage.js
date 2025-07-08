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
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
} from "@mui/material";

const YEARS = Array.from({ length: 21 }, (_, i) => 2000 + i);
const PROPERTY_TYPES = ["House", "Condo", "Apartment"];

// Dummy results
const DUMMY_RESULTS = [
  { region: "Toronto", property_type: "Condo", year: 2020, price: 625000 },
  { region: "Vancouver", property_type: "House", year: 2019, price: 610000 },
];

export default function ReverseLookupPage() {
  const [targetPrice, setTargetPrice] = useState("");
  const [margin, setMargin] = useState(25000);
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    setLoading(true);
    // stub: show dummy results
    setTimeout(() => {
      setResults(DUMMY_RESULTS);
      setLoading(false);
    }, 500);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Where Did This Price Exist?
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Enter a price and optional filters to find regions within ±margin.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <TextField
              label="Target Price (CAD)"
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </FormControl>

          <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <TextField
              label="Margin (± CAD)"
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
            />
          </FormControl>

          <FormControl size="small" sx={{ flex: "1 1 150px" }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(e.target.value)}
            >
              <MenuItem value="">
                <em>Any</em>
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
                <em>Any</em>
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
            sx={{ flex: "0 0 120px", height: 40 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Search"
            )}
          </Button>
        </Stack>
      </Paper>

      {results.length > 0 && (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Region</TableCell>
                  <TableCell>Property Type</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell align="right">Price (CAD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.region}</TableCell>
                    <TableCell>{row.property_type}</TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat("en-CA", {
                        style: "currency",
                        currency: "CAD",
                        maximumFractionDigits: 0,
                      }).format(row.price)}
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
