import React, { useEffect, useState } from "react";
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
import { apiClient } from "../config/api";

export default function DataGapsPage() {
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [years, setYears] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    apiClient.get("/meta/housing")
      .then((meta) => {
        setYears(meta.years || []);
        setPropertyTypes(meta.property_types || []);
      })
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!year || !propertyType) return;
    setLoading(true);
    setResults([]);
    try {
      const params = new URLSearchParams({ year, property_type: propertyType });
      const res = await apiClient.get(`/data-gaps?${params.toString()}`);
      setResults(res);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Gap Finder
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Find regions with housing‐price data but no income data for a given year and property type.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={e => setYear(e.target.value)}>
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Property Type</InputLabel>
            <Select value={propertyType} label="Property Type" onChange={e => setPropertyType(e.target.value)}>
              {propertyTypes.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleSearch} disabled={loading || !year || !propertyType}>
            {loading ? <CircularProgress size={20} color="inherit"/> : "Search"}
          </Button>
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32}/>
        </Box>
      )}

      {!loading && results.length > 0 && (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Region ID</TableCell>
                  <TableCell>Region Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r,i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.region_id}</TableCell>
                    <TableCell>{r.region}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!loading && year && propertyType && results.length === 0 && (
        <Typography align="center" color="text.secondary">
          No data gaps found.
        </Typography>
      )}
    </Container>
  );
}
