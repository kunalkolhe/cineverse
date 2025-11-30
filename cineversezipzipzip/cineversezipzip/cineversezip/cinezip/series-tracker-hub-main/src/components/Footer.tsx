import { Link } from "react-router-dom";
import { Github, Instagram, Linkedin, Mail, Twitter } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/" },
      { label: "Pricing", to: "/pricing" },
      { label: "Roadmap", to: "/roadmap" },
      { label: "Releases", to: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Partners", to: "/partners" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", to: "/support" },
      { label: "Community", to: "/community" },
      { label: "Blog", to: "/blog" },
      { label: "Status", to: "/status" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div>
              <span className="text-2xl font-semibold text-foreground">CineVerse</span>
              <p className="mt-2 text-sm text-muted-foreground">
                The universe of movies and series—organized for you. Discover new favorites and keep your watchlist in sync everywhere.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4" />
              hello@cineverse.app
            </div>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-foreground transition hover:bg-foreground/10"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-foreground transition hover:bg-foreground/10"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-foreground transition hover:bg-foreground/10"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2 text-foreground transition hover:bg-foreground/10"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-base font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CineVerse. All rights reserved.</p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

