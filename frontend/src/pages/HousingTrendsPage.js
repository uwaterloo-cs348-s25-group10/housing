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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
import "./HousingTrendsPage.css";

export default function HousingTrendsPage() {
  const [provinces, setProvinces] = useState([]);
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // on mount: load provinces, years & property types
  useEffect(() => {
    apiClient
      .get("/meta/housing")
      .then((meta) => {
        setProvinces(meta.provinces);
        setYears(meta.years);
        setPropertyTypes(meta.property_types);
      })
      .catch(console.error);
  }, []);

  // when province changes: fetch regions
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

  // search real data
  const handleSearch = async () => {
    setSearched(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (province && province !== "All Provinces") params.append("province", province);
      if (region && region !== "All Regions") params.append("region", region);
      if (year && year !== "All Years") params.append("year", year);
      if (propertyType && propertyType !== "All Property Types") params.append("property_type", propertyType);

      const results = await apiClient.get(`/trends/housing?${params}`);
      setData(results);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Explore Historical Housing Prices
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View average prices by region, year, and property type.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
          alignItems="center"
        >
          <FormControl size="small" sx={{ flex: "1 1 200px" }}>
            <InputLabel>Province</InputLabel>
            <Select
              value={province}
              label="Province"
              onChange={(e) => setProvince(e.target.value)}
            >
              <MenuItem value="All Provinces">
                <em>All Provinces</em>
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
              <MenuItem value="All Regions">
                <em>All Regions</em>
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
              <MenuItem value="All Years">
                <em>All Years</em>
              </MenuItem>
              {years.map((y) => (
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
              <MenuItem value="All Property Types">
                <em>All Property Types</em>
              </MenuItem>
              {propertyTypes.map((pt) => (
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

      {searched && !loading && data.length === 0 && (
        <Typography align="center" color="text.secondary">
          No housing data found.
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
                <TableCell>Property Type</TableCell>
                <TableCell align="right">Average Price (CAD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{row.province}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.property_type}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat("en-CA", {
                      style: "currency",
                      currency: "CAD",
                      maximumFractionDigits: 0,
                    }).format(row.avg_price)}
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
