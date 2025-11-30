import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Heart, Bookmark, Search, Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
}

const FloatingActionButton = ({ actions }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const defaultActions: FABAction[] = [
    { 
      icon: Home, 
      label: "Home", 
      onClick: () => navigate("/"), 
      color: "bg-blue-500" 
    },
    { 
      icon: Search, 
      label: "Search", 
      onClick: () => navigate("/search"), 
      color: "bg-purple-500" 
    },
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      onClick: () => navigate("/dashboard"), 
      color: "bg-green-500" 
    },
    { 
      icon: Bookmark, 
      label: "Watchlist", 
      onClick: () => navigate("/watchlist"), 
      color: "bg-orange-500" 
    },
  ];

  const fabActions = actions || defaultActions;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
              closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
            }}
          >
            {fabActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  variants={{
                    open: { 
                      y: 0, 
                      opacity: 1, 
                      scale: 1,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    },
                    closed: { 
                      y: 50, 
                      opacity: 0, 
                      scale: 0.5,
                      transition: { duration: 0.2 }
                    },
                  }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full",
                    "glass hover:bg-white/10 transition-all duration-300",
                    "group shadow-lg hover:shadow-xl"
                  )}
                  whileHover={{ scale: 1.05, x: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {action.label}
                  </span>
                  <div className={cn(
                    "p-2 rounded-full",
                    action.color || "bg-primary"
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-4 rounded-full shadow-2xl",
          "bg-gradient-to-r from-primary to-accent",
          "hover:shadow-glow-lg transition-shadow duration-300"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
