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
  CircularProgress,
  Box,
} from "@mui/material";
import { apiClient } from "../config/api";

const YEARS = Array.from({ length: 10 }, (_, i) => 2015 + i); 
const PROPERTY_TYPES = ["Condo", "Single Family", "Duplex"];

export default function DownPaymentSimulatorPage() {
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [downPct, setDownPct] = useState(0.15);
  const [savePct, setSavePct] = useState(0.25);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!year || !propertyType) return;
    setLoading(true);
    setResults([]);
    try {
      const params = new URLSearchParams();
      params.append("year", year);
      params.append("property_type", propertyType);
      params.append("down_pct", downPct);
      params.append("save_pct", savePct);

      const res = await apiClient.get(`/downpayment-simulator/?${params}`);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom align="left">
        Down Payment Savings Simulator
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        align="left"
      >
        Estimate how many years it takes to save a down payment on a property
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
              {PROPERTY_TYPES.map((pt) => (
                <MenuItem key={pt} value={pt}>
                  {pt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Down Payment %"
            type="number"
            size="small"
            sx={{ flex: "1 1 150px" }}
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={downPct}
            onChange={(e) => setDownPct(parseFloat(e.target.value) || 0)}
          />

          <TextField
            label="Savings %"
            type="number"
            size="small"
            sx={{ flex: "1 1 150px" }}
            inputProps={{ step: 0.01, min: 0, max: 1 }}
            value={savePct}
            onChange={(e) => setSavePct(parseFloat(e.target.value) || 0)}
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !year || !propertyType}
            sx={{ flex: "0 0 140px", height: 40 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Run"}
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
                  <TableCell align="right">Down Payment</TableCell>
                  <TableCell align="right">Annual Savings</TableCell>
                  <TableCell align="right">Years to Goal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{row.region_id}</TableCell>
                    <TableCell>{row.region}</TableCell>
                    <TableCell align="right">
                      {row.down_payment.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {row.annual_savings.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {row.years_to_goal}
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
