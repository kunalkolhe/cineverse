import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

const ShimmerSkeleton = ({ className, variant = "rectangular" }: ShimmerSkeletonProps) => {
  const baseStyles = "relative overflow-hidden bg-muted/50";
  
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl aspect-[2/3]",
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

const MediaCardSkeleton = () => (
  <div className="space-y-3">
    <ShimmerSkeleton variant="card" className="w-full" />
    <div className="space-y-2 px-1">
      <ShimmerSkeleton variant="text" className="w-3/4" />
      <ShimmerSkeleton variant="text" className="w-1/2 h-3" />
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-background via-muted to-background overflow-hidden">
    <div className="absolute inset-0">
      <ShimmerSkeleton className="w-full h-full rounded-none" />
    </div>
    <div className="absolute inset-0 flex items-end">
      <div className="container mx-auto px-4 pb-20 space-y-4">
        <div className="flex gap-3">
          <ShimmerSkeleton className="h-8 w-24 rounded-full" />
          <ShimmerSkeleton className="h-8 w-16 rounded-full" />
        </div>
        <ShimmerSkeleton className="h-14 w-96 max-w-full" />
        <ShimmerSkeleton className="h-6 w-64" />
        <ShimmerSkeleton className="h-20 w-[600px] max-w-full" />
        <div className="flex gap-4 pt-4">
          <ShimmerSkeleton className="h-12 w-36 rounded-lg" />
          <ShimmerSkeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const ContentSectionSkeleton = () => (
  <section className="space-y-6">
    <ShimmerSkeleton variant="text" className="h-8 w-64" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

export { ShimmerSkeleton, MediaCardSkeleton, HeroSkeleton, ContentSectionSkeleton };
export default ShimmerSkeleton;
