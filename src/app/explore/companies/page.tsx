"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { companiesApi, Company, CompanyFilters } from "@/lib/api/companies";
import {
  Container,
  Typography,
  Grid,
  Avatar,
  Chip,
  Skeleton,
  Box,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Business,
  LocationOn,
  People,
  Work,
  Star,
  Verified,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

export default function ExploreCompaniesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CompanyFilters>({
    page: 1,
    limit: 12,
    search: "",
    industry: "",
    companySize: "",
    sortBy: "popular",
  });
  const [filterOptions, setFilterOptions] = useState<{
    industries: string[];
    locations: string[];
    sizes: string[];
  }>({ industries: [], locations: [], sizes: [] });
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
    fetchFilterOptions();
  }, [filters.page, filters.industry, filters.companySize, filters.sortBy]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companiesApi.getCompanies(filters);
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await companiesApi.getFilterOptions();
      if (response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  const handleSearch = () => {
    fetchCompanies();
  };

  const handleFollow = async (companyId: string) => {
    if (!isAuthenticated) {
      showSnackbar("Please login to follow companies", "info");
      return;
    }

    setFollowingLoading(companyId);
    try {
      const response = await companiesApi.toggleFollow(companyId);
      if (response.success) {
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === companyId
              ? {
                  ...c,
                  isFollowing: response.data?.isFollowing,
                  followersCount: c.followersCount + (response.data?.isFollowing ? 1 : -1),
                }
              : c
          )
        );
        showSnackbar(
          response.data?.isFollowing ? "Following company" : "Unfollowed company",
          "success"
        );
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to update follow status", "error");
    } finally {
      setFollowingLoading(null);
    }
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
            Explore Companies
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-6">
            Discover top companies, read reviews, and find your ideal workplace
          </Typography>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search companies..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  fullWidth
                  leftIcon={<Search className="text-grey-400" />}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={filters.industry}
                    label="Industry"
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  >
                    <MenuItem value="">All Industries</MenuItem>
                    {filterOptions.industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={filters.companySize}
                    label="Company Size"
                    onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
                  >
                    <MenuItem value="">All Sizes</MenuItem>
                    {filterOptions.sizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value as CompanyFilters["sortBy"] })
                    }
                  >
                    <MenuItem value="popular">Most Popular</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="alphabetical">A-Z</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button variant="primary" fullWidth onClick={handleSearch}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Companies Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rounded" height={280} />
                </Grid>
              ))}
            </Grid>
          ) : companies.length === 0 ? (
            <Card className="p-12 text-center">
              <Business className="text-grey-300 text-6xl mb-4" />
              <Typography variant="h6" className="text-grey-600 mb-2">
                No companies found
              </Typography>
              <Typography className="text-grey-500">
                Try adjusting your search filters
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {companies.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company._id}>
                  <Card className="p-5 h-full hover:shadow-lg transition-shadow">
                    <Box className="flex items-start justify-between mb-4">
                      <Box className="flex items-center gap-3">
                        <Avatar
                          src={company.logo?.url}
                          variant="rounded"
                          className="w-14 h-14 bg-grey-100"
                        >
                          {company.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Box className="flex items-center gap-1">
                            <Typography
                              className="font-semibold text-grey-900 dark:text-white cursor-pointer hover:text-primary-600"
                              onClick={() => router.push(`/companies/${company.slug || company._id}`)}
                            >
                              {company.name}
                            </Typography>
                            {company.isVerified && (
                              <Verified className="text-primary-600" fontSize="small" />
                            )}
                          </Box>
                          <Typography className="text-sm text-grey-500">
                            {company.industry}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleFollow(company._id)}
                        isLoading={followingLoading === company._id}
                        className={company.isFollowing ? "text-error-500" : "text-grey-500"}
                      >
                        {company.isFollowing ? <Favorite /> : <FavoriteBorder />}
                      </Button>
                    </Box>

                    <Typography className="text-sm text-grey-600 dark:text-grey-400 mb-4 line-clamp-2">
                      {company.shortDescription || company.description || "No description available"}
                    </Typography>

                    <Box className="flex items-center gap-2 mb-3">
                      <Rating value={company.ratings.overall} precision={0.1} size="small" readOnly />
                      <Typography className="text-sm text-grey-600">
                        {company.ratings.overall.toFixed(1)} ({company.ratings.totalReviews} reviews)
                      </Typography>
                    </Box>

                    <Box className="flex flex-wrap gap-2 mb-4">
                      {company.headquarters?.city && (
                        <Chip
                          icon={<LocationOn fontSize="small" />}
                          label={company.headquarters.city}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {company.companySize && (
                        <Chip
                          icon={<People fontSize="small" />}
                          label={company.companySize}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box className="flex items-center justify-between pt-3 border-t border-grey-200 dark:border-grey-700">
                      <Box className="flex items-center gap-4 text-sm text-grey-500">
                        <span className="flex items-center gap-1">
                          <Work fontSize="small" />
                          {company.activeJobsCount || 0} jobs
                        </span>
                        <span className="flex items-center gap-1">
                          <People fontSize="small" />
                          {company.followersCount} followers
                        </span>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => router.push(`/companies/${company.slug || company._id}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}
