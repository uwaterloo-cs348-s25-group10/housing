import React, { useState, useEffect } from "react";
import { apiClient } from "../config/api";
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
  CircularProgress,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import "./IncomeTrendsPage.css";

export default function IncomeTrendsPage() {
  const [provinces, setProvinces] = useState([]);
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);

  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // on mount, load province & year options
  useEffect(() => {
    apiClient
      .get("/meta/income")
      .then((meta) => {
        setProvinces(meta.provinces);
        setYears(meta.years);
      })
      .catch(console.error);
  }, []);

  // when province changes, load its regions
  useEffect(() => {
    if (!province) {
      setRegions([]);
      setRegion("");
    } else {
      apiClient
        .get(`/meta/regions/${province}`)
        .then(setRegions)
        .catch(console.error);
    }
  }, [province]);

  const handleSearch = async () => {
    setSearched(true);
    setLoading(true);
    try {
      const params = new URLSearchParams({ province, year });
      if (region) params.append("region", region);
      const results = await apiClient.get(
        `/trends/income?${params.toString()}`
      );
      setData(results);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Explore Historical Income
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View average incomes by region and year across Canada.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <InputLabel>Province</InputLabel>
            <Select
              value={province}
              label="Province"
              onChange={(e) => setProvince(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {provinces.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ flex: "1 1 200px" }}
            disabled={!province}
          >
            <InputLabel>Region</InputLabel>
            <Select
              value={region}
              label="Region"
              onChange={(e) => setRegion(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {regions.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
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

      {searched && !loading && data.length === 0 && (
        <Typography align="center" color="text.secondary">
          No income data found.
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {data.length > 0 && !loading && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Region</TableCell>
                <TableCell>Province</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right">Average Income (CAD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{row.province}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat("en-CA", {
                      style: "currency",
                      currency: "CAD",
                      maximumFractionDigits: 0,
                    }).format(row.avg_income)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
