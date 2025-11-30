import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smile, 
  Heart, 
  Zap, 
  Ghost, 
  Laugh, 
  Brain, 
  Sparkles,
  Drama,
  Sword,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Mood {
  id: string;
  label: string;
  icon: React.ElementType;
  genres: number[];
  color: string;
  gradient: string;
}

const MOODS: Mood[] = [
  { 
    id: "happy", 
    label: "Happy", 
    icon: Smile, 
    genres: [35, 10751], 
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  { 
    id: "romantic", 
    label: "Romantic", 
    icon: Heart, 
    genres: [10749], 
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-rose-500/20"
  },
  { 
    id: "excited", 
    label: "Excited", 
    icon: Zap, 
    genres: [28, 12], 
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  { 
    id: "scared", 
    label: "Thrilling", 
    icon: Ghost, 
    genres: [27, 53], 
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-500/20"
  },
  { 
    id: "funny", 
    label: "Funny", 
    icon: Laugh, 
    genres: [35], 
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  { 
    id: "thoughtful", 
    label: "Thoughtful", 
    icon: Brain, 
    genres: [18, 99], 
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  { 
    id: "magical", 
    label: "Magical", 
    icon: Sparkles, 
    genres: [14, 16], 
    color: "text-indigo-400",
    gradient: "from-indigo-500/20 to-purple-500/20"
  },
  { 
    id: "dramatic", 
    label: "Dramatic", 
    icon: Drama, 
    genres: [18], 
    color: "text-red-400",
    gradient: "from-red-500/20 to-pink-500/20"
  },
  { 
    id: "adventurous", 
    label: "Adventure", 
    icon: Sword, 
    genres: [12, 28], 
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-yellow-500/20"
  },
  { 
    id: "scifi", 
    label: "Sci-Fi", 
    icon: Rocket, 
    genres: [878], 
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (moodId: string, genres: number[]) => void;
}

const MoodSelector = ({ selectedMood, onMoodSelect }: MoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold">What's your mood?</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {MOODS.map((mood, index) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          const isHovered = hoveredMood === mood.id;
          
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              onClick={() => onMoodSelect(mood.id, mood.genres)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                "border backdrop-blur-sm",
                isSelected 
                  ? `bg-gradient-to-r ${mood.gradient} border-white/20 shadow-lg` 
                  : "bg-card/50 border-border/50 hover:border-white/20",
                isSelected && "glow-primary"
              )}
            >
              <motion.div
                animate={isSelected || isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isSelected ? mood.color : "text-muted-foreground"
                )} />
              </motion.div>
              <span className={cn(
                "text-sm font-medium transition-colors duration-300",
                isSelected ? "text-white" : "text-muted-foreground"
              )}>
                {mood.label}
              </span>
              
              {isSelected && (
                <motion.div
                  layoutId="mood-indicator"
                  className="absolute inset-0 rounded-full border-2 border-primary/50"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <motion.p 
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              className="text-sm text-muted-foreground pt-2"
            >
              Showing content that matches your{" "}
              <span className="text-primary font-medium">
                {MOODS.find(m => m.id === selectedMood)?.label}
              </span>{" "}
              mood
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodSelector;
