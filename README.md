<div align="center">

# 🎬 CineVerse

### Your Ultimate Movie & TV Series Discovery Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CineVerse-ff6b6b?style=for-the-badge&logo=vercel)](https://cineverse.anicircle.xyz)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<p align="center">
  <img src="https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png" alt="CineVerse Banner" width="600"/>
</p>

**Discover. Track. Explore.**

[Live Demo](https://cineverse.anicircle.xyz) | [Report Bug](https://github.com/kunalkolhe/cineverse/issues) | [Request Feature](https://github.com/kunalkolhe/cineverse/issues)

</div>

---

## 📖 About The Project

CineVerse is a modern, feature-rich movie and TV series discovery platform that provides users with an immersive experience to explore, search, and track their favorite entertainment content. Built with cutting-edge technologies and powered by TMDB API, it delivers real-time data on millions of movies and TV shows.

### 🎯 Why CineVerse?

- **Real-Time Data** - Access up-to-date information on movies and TV shows
- **Beautiful UI** - Modern glass-morphism design with smooth animations
- **Responsive** - Seamless experience across all devices
- **Fast & Efficient** - Built with Vite for lightning-fast performance

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 Smart Discovery
- Trending movies & TV shows
- Top rated content
- Now playing in theaters
- Upcoming releases
- Airing today

</td>
<td width="50%">

### 🎨 Modern UI/UX
- Glass-morphism design
- Dark/Light mode toggle
- Smooth Framer Motion animations
- Responsive on all devices

</td>
</tr>
<tr>
<td width="50%">

### 📺 Detailed Information
- Full movie/series details
- Season & episode breakdown
- Cast & crew information
- Ratings & reviews
- Trailers & videos

</td>
<td width="50%">

### 🔎 Advanced Search
- Real-time search suggestions
- Filter by movies or TV shows
- Multi-language support
- Category filtering

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white) |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **State Management** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white) |
| **API** | ![TMDB](https://img.shields.io/badge/TMDB_API-01D277?style=flat-square&logo=themoviedatabase&logoColor=white) |

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

```bash
# Clone the repository
git clone https://github.com/kunalkolhe/cineverse.git

# Navigate to project directory
cd cineverse

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your TMDB API key to .env
VITE_TMDB_API_KEY=your_api_key_here

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

---

## 📁 Project Structure

```
cineverse/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MovieCard.tsx
│   │   └── ...
│   ├── pages/            # Application pages
│   │   ├── Index.tsx
│   │   ├── MovieDetail.tsx
│   │   ├── SeriesDetail.tsx
│   │   └── ...
│   ├── integrations/     # API integrations
│   │   └── supabase/
│   │       └── tmdb.ts   # TMDB API functions
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── public/               # Static assets
└── package.json
```

---

## 🌟 Key Highlights

- **Clean Architecture** - Well-organized codebase following best practices
- **Type Safety** - Full TypeScript implementation for robust code
- **Performance Optimized** - Lazy loading, code splitting, and caching
- **Accessible** - Built with accessibility in mind using Radix UI
- **SEO Friendly** - Proper meta tags and semantic HTML

---

## 📸 Screenshots

<div align="center">
<p><em>Add your screenshots here</em></p>
</div>

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Kunal Kolhe**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/kunalkolhe)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kunalkolhe)

---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) - For the amazing movie database API
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - For smooth animations

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

Made with ❤️ by [Kunal Kolhe](https://github.com/kunalkolhe)

</div>
