import React, { useState, useEffect } from "react";
import "./IncomeTrendsPage.css";
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

const PROVINCES = [
  { code: "ON", name: "Ontario" },
  { code: "QC", name: "Quebec" },
  { code: "BC", name: "British Columbia" },
];

const REGIONS = {
  ON: ["Toronto", "Ottawa"],
  QC: ["Montreal", "Quebec City"],
  BC: ["Vancouver", "Victoria"],
};

export default function IncomeTrendsPage() {
  const [province, setProvince] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (province) setRegions(REGIONS[province] || []);
    else {
      setRegions([]);
      setRegion("");
    }
  }, [province]);

  const handleSearch = () => {
    setSearched(true);
    setLoading(true);

    // stubbed data
    setTimeout(() => {
      const results = Array.from({ length: 6 }).map(() => {
        const prov = PROVINCES[Math.floor(Math.random() * PROVINCES.length)];
        const regs = REGIONS[prov.code];
        const reg = regs[Math.floor(Math.random() * regs.length)];
        const yr = 2000 + Math.floor(Math.random() * 21);
        const income =
          Math.round((50000 + Math.random() * 100000) / 1000) * 1000;
        return {
          region: reg,
          province: prov.code,
          year: yr,
          avg_income: income,
        };
      });
      setData(results);
      setLoading(false);
    }, 600);
  };

  return (
    <Container maxWidth="lg" className="page-container" sx={{ pt: 4, pb: 4 }}>
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
              {PROVINCES.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.name}
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
              {Array.from({ length: 21 }, (_, i) => 2000 + i).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="medium"
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
              {data.map((row, idx) => (
                <TableRow key={idx} hover>
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
