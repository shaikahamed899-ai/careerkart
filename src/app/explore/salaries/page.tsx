"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { salariesApi, SalaryInsight, SalaryEntry } from "@/lib/api/salaries";
import {
  Container,
  Typography,
  Grid,
  Avatar,
  Skeleton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  AttachMoney,
  TrendingUp,
  Business,
  LocationOn,
  WorkOutline,
} from "@mui/icons-material";

export default function ExploreSalariesPage() {
  const [insights, setInsights] = useState<SalaryInsight | null>(null);
  const [salaries, setSalaries] = useState<SalaryEntry[]>([]);
  const [popularTitles, setPopularTitles] = useState<Array<{ _id: string; count: number; avgSalary: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobTitle: "",
    location: "",
    company: "",
  });
  const [filterOptions, setFilterOptions] = useState<{
    jobTitles: string[];
    locations: string[];
    companies: Array<{ _id: string; name: string }>;
  }>({ jobTitles: [], locations: [], companies: [] });

  useEffect(() => {
    fetchData();
    fetchFilterOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insightsRes, salariesRes, titlesRes] = await Promise.all([
        salariesApi.getInsights(filters),
        salariesApi.search({ ...filters, limit: 10 }),
        salariesApi.getPopularTitles(),
      ]);

      setInsights(insightsRes.data || null);
      setSalaries(salariesRes.data || []);
      setPopularTitles(titlesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch salary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await salariesApi.getFilterOptions();
      if (response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const formatSalary = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-2 text-grey-900 dark:text-white"
          >
            Salary Insights
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-6">
            Explore salary data and compare compensation across roles and companies
          </Typography>

          {/* Search Filters */}
          <Card className="p-4 mb-6">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  placeholder="Job title..."
                  value={filters.jobTitle}
                  onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
                  fullWidth
                  leftIcon={<Search className="text-grey-400" />}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    label="Location"
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {filterOptions.locations.map((loc) => (
                      <MenuItem key={loc} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={filters.company}
                    label="Company"
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  >
                    <MenuItem value="">All Companies</MenuItem>
                    {filterOptions.companies.map((company) => (
                      <MenuItem key={company._id} value={company._id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="primary" fullWidth onClick={handleSearch}>
                  Search Salaries
                </Button>
              </Grid>
            </Grid>
          </Card>

          {loading ? (
            <Box className="space-y-6">
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Skeleton variant="rounded" height={120} />
                  </Grid>
                ))}
              </Grid>
              <Skeleton variant="rounded" height={300} />
            </Box>
          ) : (
            <>
              {/* Salary Overview */}
              {insights && (
                <Grid container spacing={3} className="mb-6">
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="p-5 text-center">
                      <AttachMoney className="text-success-600 text-3xl mb-2" />
                      <Typography className="text-sm text-grey-500 mb-1">
                        Average Salary
                      </Typography>
                      <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                        {formatSalary(insights.overview.avgSalary)}
                      </Typography>
                      <Typography className="text-xs text-grey-500">per year</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="p-5 text-center">
                      <TrendingUp className="text-primary-600 text-3xl mb-2" />
                      <Typography className="text-sm text-grey-500 mb-1">
                        Salary Range
                      </Typography>
                      <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
                        {formatSalary(insights.overview.minSalary)} - {formatSalary(insights.overview.maxSalary)}
                      </Typography>
                      <Typography className="text-xs text-grey-500">min - max</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="p-5 text-center">
                      <WorkOutline className="text-accent-600 text-3xl mb-2" />
                      <Typography className="text-sm text-grey-500 mb-1">
                        Data Points
                      </Typography>
                      <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                        {insights.overview.count}
                      </Typography>
                      <Typography className="text-xs text-grey-500">salary entries</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="p-5 text-center">
                      <Business className="text-info-600 text-3xl mb-2" />
                      <Typography className="text-sm text-grey-500 mb-1">
                        Avg Experience
                      </Typography>
                      <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                        {insights.overview.avgExperience?.toFixed(1) || "N/A"}
                      </Typography>
                      <Typography className="text-xs text-grey-500">years</Typography>
                    </Card>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={4}>
                {/* Popular Job Titles */}
                <Grid item xs={12} md={6}>
                  <Card className="p-5 h-full">
                    <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
                      Popular Job Titles
                    </Typography>
                    {popularTitles.length === 0 ? (
                      <Typography className="text-grey-500 text-center py-8">
                        No data available
                      </Typography>
                    ) : (
                      <Box className="space-y-4">
                        {popularTitles.slice(0, 8).map((title, index) => (
                          <Box key={title._id} className="flex items-center justify-between">
                            <Box className="flex items-center gap-3">
                              <Box className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-600">
                                {index + 1}
                              </Box>
                              <Box>
                                <Typography className="font-medium text-grey-900 dark:text-white">
                                  {title._id}
                                </Typography>
                                <Typography className="text-xs text-grey-500">
                                  {title.count} salaries
                                </Typography>
                              </Box>
                            </Box>
                            <Typography className="font-semibold text-success-600">
                              {formatSalary(title.avgSalary)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Top Paying Companies */}
                <Grid item xs={12} md={6}>
                  <Card className="p-5 h-full">
                    <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
                      Top Paying Companies
                    </Typography>
                    {!insights?.topCompanies || insights.topCompanies.length === 0 ? (
                      <Typography className="text-grey-500 text-center py-8">
                        No data available
                      </Typography>
                    ) : (
                      <Box className="space-y-4">
                        {insights.topCompanies.slice(0, 8).map((company, index) => (
                          <Box key={company.companyName} className="flex items-center justify-between">
                            <Box className="flex items-center gap-3">
                              <Avatar
                                src={company.companyLogo}
                                className="w-10 h-10 bg-grey-100"
                              >
                                {company.companyName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography className="font-medium text-grey-900 dark:text-white">
                                  {company.companyName}
                                </Typography>
                                <Typography className="text-xs text-grey-500">
                                  {company.count} salaries
                                </Typography>
                              </Box>
                            </Box>
                            <Typography className="font-semibold text-success-600">
                              {formatSalary(company.avgSalary)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Salary by Experience */}
                {insights?.byExperience && insights.byExperience.length > 0 && (
                  <Grid item xs={12}>
                    <Card className="p-5">
                      <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
                        Salary by Experience Level
                      </Typography>
                      <Box className="space-y-4">
                        {insights.byExperience.map((exp) => {
                          const maxSalary = Math.max(...insights.byExperience.map((e) => e.avgSalary));
                          const percentage = (exp.avgSalary / maxSalary) * 100;
                          return (
                            <Box key={exp._id}>
                              <Box className="flex justify-between mb-1">
                                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300">
                                  {exp._id} years
                                </Typography>
                                <Typography className="text-sm font-semibold text-success-600">
                                  {formatSalary(exp.avgSalary)}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                className="h-2 rounded-full"
                              />
                              <Typography className="text-xs text-grey-500 mt-1">
                                {exp.count} data points
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>
                )}

                {/* Recent Salary Entries */}
                <Grid item xs={12}>
                  <Card className="p-5">
                    <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
                      Recent Salary Entries
                    </Typography>
                    {salaries.length === 0 ? (
                      <Typography className="text-grey-500 text-center py-8">
                        No salary entries found
                      </Typography>
                    ) : (
                      <Box className="space-y-3">
                        {salaries.map((salary) => (
                          <Box
                            key={salary._id}
                            className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl"
                          >
                            <Box className="flex items-center gap-4">
                              <Avatar
                                src={salary.company.logo?.url}
                                className="w-12 h-12 bg-grey-200"
                              >
                                {salary.company.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography className="font-semibold text-grey-900 dark:text-white">
                                  {salary.jobTitle}
                                </Typography>
                                <Typography className="text-sm text-grey-500">
                                  {salary.company.name}
                                </Typography>
                                <Box className="flex items-center gap-2 mt-1">
                                  {salary.location?.city && (
                                    <Chip
                                      icon={<LocationOn fontSize="small" />}
                                      label={salary.location.city}
                                      size="small"
                                      variant="outlined"
                                      className="text-xs"
                                    />
                                  )}
                                  {salary.totalExperience && (
                                    <Chip
                                      label={`${salary.totalExperience} yrs exp`}
                                      size="small"
                                      variant="outlined"
                                      className="text-xs"
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            <Box className="text-right">
                              <Typography variant="h6" className="font-bold text-success-600">
                                {formatSalary(salary.baseSalary.amount)}
                              </Typography>
                              <Typography className="text-xs text-grey-500">
                                per {salary.baseSalary.period || "year"}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}
