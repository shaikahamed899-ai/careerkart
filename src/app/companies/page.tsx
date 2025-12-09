"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useCompanies, useToggleFollowCompany } from "@/lib/api/hooks/useCompanies";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Company } from "@/lib/api/companies";
import {
  Container,
  Grid,
  Typography,
  Skeleton,
  Chip,
  Rating,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Search,
  Business,
  LocationOn,
  People,
  Star,
  Bookmark,
  BookmarkBorder,
  Work,
} from "@mui/icons-material";

export default function CompaniesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSnackbar, openSignIn } = useUIStore();
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest" | "alphabetical">("popular");

  const { data, isLoading, refetch } = useCompanies({
    page,
    limit: 12,
    search: searchQuery || undefined,
    industry: industry || undefined,
    companySize: companySize || undefined,
    sortBy,
  });

  const followMutation = useToggleFollowCompany();
  const companies = data?.data || [];

  const handleFollow = async (companyId: string) => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    try {
      await followMutation.mutateAsync(companyId);
      showSnackbar("Company follow status updated", "success");
      refetch();
    } catch (error) {
      showSnackbar("Failed to update follow status", "error");
    }
  };

  const renderCompanyCard = (company: Company) => (
    <Card
      key={company._id}
      className="p-5 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => router.push(`/companies/${company.slug}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
            {company.logo?.url ? (
              <img src={company.logo.url} alt={company.name} className="w-10 h-10 object-contain" />
            ) : (
              <Business className="text-primary-600 text-2xl" />
            )}
          </div>
          <div>
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white line-clamp-1">
              {company.name}
            </Typography>
            <Typography variant="body2" className="text-grey-500">
              {company.industry}
            </Typography>
          </div>
        </div>
        <Button
          variant="ghost"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleFollow(company._id);
          }}
        >
          {company.isFollowing ? (
            <Bookmark className="text-primary-600" />
          ) : (
            <BookmarkBorder />
          )}
        </Button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <Rating value={company.ratings.overall} precision={0.1} size="small" readOnly />
        <Typography variant="body2" className="font-medium">
          {company.ratings.overall.toFixed(1)}
        </Typography>
        <Typography variant="caption" className="text-grey-500">
          ({company.ratings.totalReviews} reviews)
        </Typography>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-grey-600 dark:text-grey-400">
        {company.headquarters?.city && (
          <div className="flex items-center gap-1">
            <LocationOn fontSize="small" />
            <span>{company.headquarters.city}</span>
          </div>
        )}
        {company.companySize && (
          <div className="flex items-center gap-1">
            <People fontSize="small" />
            <span>{company.companySize} employees</span>
          </div>
        )}
      </div>

      {/* Description */}
      {company.shortDescription && (
        <Typography variant="body2" className="text-grey-600 dark:text-grey-400 line-clamp-2 mb-4">
          {company.shortDescription}
        </Typography>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        <Chip label={company.companyType} size="small" className="capitalize" />
        {company.isVerified && (
          <Chip label="Verified" size="small" color="success" />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-grey-200 dark:border-grey-700">
        <div className="flex items-center gap-1 text-primary-600">
          <Work fontSize="small" />
          <Typography variant="body2" className="font-medium">
            {company.activeJobsCount || 0} open jobs
          </Typography>
        </div>
        <Typography variant="caption" className="text-grey-500">
          {company.followersCount.toLocaleString()} followers
        </Typography>
      </div>
    </Card>
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-900">
        {/* Search Header */}
        <section className="bg-white dark:bg-grey-950 border-b border-grey-200 dark:border-grey-800 py-8">
          <Container maxWidth="lg">
            <Typography variant="h4" className="font-bold text-grey-900 dark:text-white mb-2">
              Explore Companies
            </Typography>
            <Typography variant="body1" className="text-grey-600 dark:text-grey-400 mb-6">
              Discover great places to work and explore company reviews, salaries, and more
            </Typography>

            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="text-grey-400" />}
                className="flex-1"
              />
              <FormControl size="small" className="w-full md:w-48">
                <InputLabel>Industry</InputLabel>
                <Select
                  value={industry}
                  label="Industry"
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <MenuItem value="">All Industries</MenuItem>
                  <MenuItem value="Information Technology">IT & Software</MenuItem>
                  <MenuItem value="Finance & Banking">Finance & Banking</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="E-commerce">E-commerce</MenuItem>
                  <MenuItem value="Consulting">Consulting</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="w-full md:w-48">
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={companySize}
                  label="Company Size"
                  onChange={(e) => setCompanySize(e.target.value)}
                >
                  <MenuItem value="">All Sizes</MenuItem>
                  <MenuItem value="1-50">1-50</MenuItem>
                  <MenuItem value="51-200">51-200</MenuItem>
                  <MenuItem value="201-500">201-500</MenuItem>
                  <MenuItem value="501-1000">501-1000</MenuItem>
                  <MenuItem value="1001-5000">1001-5000</MenuItem>
                  <MenuItem value="5001+">5001+</MenuItem>
                </Select>
              </FormControl>
              <Button variant="primary" onClick={() => { setPage(1); refetch(); }}>
                Search
              </Button>
            </div>
          </Container>
        </section>

        {/* Results */}
        <Container maxWidth="lg" className="py-8">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="font-semibold">
              {data?.total || 0} Companies Found
            </Typography>
            <FormControl size="small" className="w-40">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="alphabetical">A-Z</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={280} className="rounded-lg" />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Companies Grid */}
          {!isLoading && companies.length > 0 && (
            <Grid container spacing={3}>
              {companies.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company._id}>
                  {renderCompanyCard(company)}
                </Grid>
              ))}
            </Grid>
          )}

          {/* Empty State */}
          {!isLoading && companies.length === 0 && (
            <Card className="p-10 text-center">
              <Business className="text-6xl text-grey-300 mb-4" />
              <Typography variant="h6" className="text-grey-600 mb-2">
                No companies found
              </Typography>
              <Typography variant="body2" className="text-grey-500">
                Try adjusting your search filters
              </Typography>
            </Card>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-grey-600">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}
