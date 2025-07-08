import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const YEARS = Array.from({ length: 21 }, (_, i) => 2000 + i);
const PROPERTY_TYPES = ["House", "Condo", "Apartment"];
const REGIONS = [
  "Toronto",
  "Vancouver",
  "Montreal",
  "Calgary",
  "Ottawa",
  "Halifax",
];

// Dummy data
const DUMMY_RESULTS = [
  { region: "Calgary", hai: 30.53 },
  { region: "Ottawa", hai: 29.0 },
  { region: "Montreal", hai: 27.62 },
  { region: "Vancouver", hai: 26.36 },
  { region: "Halifax", hai: 25.0 },
];

export default function WhereCanLivePage() {
  const [started, setStarted] = useState(false);
  const [income, setIncome] = useState("");
  const [year, setYear] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [region, setRegion] = useState("");
  const [results, setResults] = useState([]);

  const startQuiz = () => {
    setStarted(true);
    setResults([]); // clear
  };

  const handleFind = () => {
    // Immediately show dummy data:
    setResults(DUMMY_RESULTS);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom align="left">
        Find Out Where You Could Have Afforded to Live
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        align="left"
      >
        Based on your income, family size, and housing preferences, we’ll
        recommend affordable regions in Canada using historical HAI data.
      </Typography>

      {/* Start Button */}
      {!started && (
        <Box mb={4} sx={{ textAlign: "left" }}>
          <Button
            onClick={startQuiz}
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

      {/* Quiz Form */}
      {started && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Stack spacing={3} alignItems="flex-start">
            <TextField
              label="What was your total annual income (in CAD)?"
              type="number"
              fullWidth
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Which year are you interested in?
              </Typography>
              <RadioGroup
                row
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {YEARS.map((y) => (
                  <FormControlLabel
                    key={y}
                    value={String(y)}
                    control={<Radio />}
                    label={String(y)}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                What kind of housing were you interested in?
              </Typography>
              <RadioGroup
                row
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                {PROPERTY_TYPES.map((pt) => (
                  <FormControlLabel
                    key={pt}
                    value={pt}
                    control={<Radio />}
                    label={pt}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Do you have a preferred region?
              </Typography>
              <RadioGroup
                row
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <FormControlLabel
                    key={r}
                    value={r}
                    control={<Radio />}
                    label={r}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Button
              onClick={handleFind}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                color: "white",
                px: 3,
                py: 1.5,
              }}
            >
              Find Affordable Regions
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Results */}
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
                    <TableCell align="right">{row.hai.toFixed(2)}</TableCell>
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
