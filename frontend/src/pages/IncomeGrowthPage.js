import { useState } from "react";
import { apiClient } from "../config/api";
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import "./IncomeGrowthPage.css";

export default function IncomeGrowthAnalysisPage() {
  const [targetYears, setTargetYears] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!targetYears || targetYears < 1) {
      alert("Please enter a valid number of years (minimum 1)");
      return;
    }

    setSearched(true);
    setLoading(true);
    setSelectedRegion(null);
    setAnalysisData(null);

    try {
      const params = new URLSearchParams({ years: targetYears });
      const results = await apiClient.get(`/income-growth/?${params}`);
      setAnalysisData(results);
    } catch (err) {
      console.error(err);
      setAnalysisData({ regions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleRegionClick = async (region) => {
    setSelectedRegion(region);
  };

  const handleTargetYearsChange = (event) => {
    const value = event.target.value;
    setTargetYears(value);
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Regional Income Growth Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Find region that has minimum X consecutive Income Growth
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Paper sx={{ p: 3, minWidth: 400 }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
            <TextField
              label="Minimum Consecutive Years"
              type="number"
              size="small"
              value={targetYears}
              onChange={handleTargetYearsChange}
              inputProps={{ min: 1, max: 20 }}
              sx={{ minWidth: 200 }}
              helperText="Enter minimum number of consecutive growth years"
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !targetYears}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Analyze"}
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 3, width: "100%", maxWidth: 1000 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
              {analysisData && (
                <Chip 
                  label={`${analysisData.total_regions} regions`} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
          </Box>

          {searched && !loading ? (
            analysisData && analysisData.regions.length > 0 ? (
              <TableContainer sx={{ maxHeight: 1000 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Region</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Province</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>Consecutive Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.regions.map((region) => (
                      <TableRow
                        key={region.region_id}
                        hover
                        sx={{ 
                          cursor: "pointer",
                          backgroundColor: selectedRegion?.region_id === region.region_id 
                            ? "action.selected" : "inherit"
                        }}
                        onClick={() => handleRegionClick(region)}
                      >
                        <TableCell sx={{ fontSize: "1rem" }}>{region.region_name}</TableCell>
                        <TableCell sx={{ fontSize: "1rem" }}>{region.province}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${region.max_consecutive_growth} years`}
                            color="success"
                            size="medium"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                No regions meet the specified criteria.
                <br />
                Try reducing the minimum consecutive years.
              </Box>
            )
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              {loading ? (
                <CircularProgress size={30} />
              ) : (
                "Enter minimum consecutive years and click 'Analyze' to start."
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}