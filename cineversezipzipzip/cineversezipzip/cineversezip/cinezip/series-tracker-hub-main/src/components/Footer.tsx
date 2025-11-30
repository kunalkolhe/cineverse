import { Link } from "react-router-dom";
import { Github, Instagram, Mail, Twitter, Film, MapPin, Phone, Heart } from "lucide-react";

const footerLinks = [
  {
    title: "Browse",
    links: [
      { label: "Movies", to: "/" },
      { label: "TV Series", to: "/" },
      { label: "Top Rated", to: "/" },
      { label: "New Releases", to: "/" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Watchlist", to: "/watchlist" },
      { label: "Watch History", to: "/history" },
      { label: "Profile", to: "/profile" },
      { label: "Settings", to: "/settings" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/support" },
      { label: "FAQ", to: "/support" },
      { label: "Contact Us", to: "/contact" },
      { label: "Report Issue", to: "/contact" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                CineVerse
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your ultimate destination for discovering and tracking movies and TV series. 
              Create watchlists, track your viewing history, and never miss your favorite shows.
            </p>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@cineverse.app" className="hover:text-foreground transition">
                  contact@cineverse.app
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Los Angeles, California, USA</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://twitter.com/cineverse"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted/80 p-2.5 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/cineverse"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted/80 p-2.5 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/cineverse"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted/80 p-2.5 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm text-muted-foreground transition hover:text-primary hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} CineVerse. All rights reserved.</p>
              <span className="hidden sm:inline">|</span>
              <p className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for movie lovers
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition">
                Cookie Policy
              </Link>
              <a 
                href="https://themoviedb.org" 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Powered by TMDB
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
