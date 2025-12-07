"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  YouTube,
} from "@mui/icons-material";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const footerLinks = [
  { label: "Talk To Donna", href: "/donna" },
  { label: "For Business", href: "/business" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Help Center", href: "/help" },
  { label: "Policies", href: "/policies" },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: LinkedIn, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: YouTube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-grey-100 dark:bg-grey-900">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Links */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Logo variant="full" size="md" />
            <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-grey-600 dark:text-grey-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="outline" size="small">
                Back To Top
              </Button>
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-grey-700 dark:text-grey-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label={social.label}
              >
                <social.icon />
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center md:text-left">
          <p className="text-grey-500 dark:text-grey-500 text-sm">
            © 2025 CareerKart All rights reserved.
          </p>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">
                Subscribe to get the latest news and tips
              </h3>
              <p className="text-white/80 text-sm md:text-base">
                from our experts
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <TextField
                placeholder="Enter your Email"
                variant="outlined"
                className="bg-primary-700/50 rounded-lg min-w-[280px]"
                InputProps={{
                  className: "text-white placeholder:text-white/60",
                }}
              />
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-grey-100"
              >
                Submit
              </Button>
            </div>
          </div>

          {/* Large CAREERKART text */}
          <div className="mt-8 overflow-hidden">
            <p className="text-primary-500/30 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider select-none">
              CAREERKART
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
